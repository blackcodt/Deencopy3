import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    if (req.method === 'POST' && action === 'trigger') {
      const { owner, repo, buildType } = await req.json();

      if (!owner || !repo) {
        return new Response(JSON.stringify({ error: 'owner and repo are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const triggerRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: { build_type: buildType || 'release' },
          }),
        }
      );

      if (!triggerRes.ok) {
        const errText = await triggerRes.text();
        throw new Error(`GitHub API error [${triggerRes.status}]: ${errText}`);
      }

      await new Promise(r => setTimeout(r, 3000));

      const runsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/build-apk.yml/runs?per_page=1`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const runsData = await runsRes.json();
      const runId = runsData.workflow_runs?.[0]?.id;

      return new Response(JSON.stringify({ success: true, runId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      const owner = url.searchParams.get('owner');
      const repo = url.searchParams.get('repo');
      const runId = url.searchParams.get('runId');

      const statusRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const statusData = await statusRes.json();

      // If completed with failure, try to get the failed step logs
      let failureReason = '';
      if (statusData.status === 'completed' && statusData.conclusion === 'failure') {
        try {
          const jobsRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );
          const jobsData = await jobsRes.json();
          const failedJob = jobsData.jobs?.[0];
          if (failedJob) {
            const failedStep = failedJob.steps?.find((s: any) => s.conclusion === 'failure');
            failureReason = failedStep
              ? `Step "${failedStep.name}" failed`
              : `Job "${failedJob.name}" failed`;
          }
        } catch {
          // ignore
        }
      }

      return new Response(JSON.stringify({
        status: statusData.status,
        conclusion: statusData.conclusion,
        html_url: statusData.html_url,
        failureReason,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'download') {
      const owner = url.searchParams.get('owner');
      const repo = url.searchParams.get('repo');
      const runId = url.searchParams.get('runId');

      const artifactsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const artifactsData = await artifactsRes.json();
      const artifact = artifactsData.artifacts?.[0];

      if (!artifact) {
        return new Response(JSON.stringify({ error: 'No artifacts found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const downloadRes = await fetch(artifact.archive_download_url, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        redirect: 'manual',
      });

      const downloadUrl = downloadRes.headers.get('location') || artifact.archive_download_url;

      return new Response(JSON.stringify({
        downloadUrl,
        name: artifact.name,
        size: artifact.size_in_bytes,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use: trigger, status, download' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Build APK error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
