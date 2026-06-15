# AI Social Hot embed package

Upload these paths to the `maevehuang10/ai-social-hot` repository, preserving the folder structure:

- `.github/workflows/daily-update.yml`
- `scripts/update-topics.mjs`
- `site/index.html`
- `site/social-content-tracker/`

After upload, the target site gets a new `内容追踪` view at:

`https://maevehuang10.github.io/ai-social-hot/site/#tracker`

The embedded tracker is loaded from:

`https://maevehuang10.github.io/ai-social-hot/site/social-content-tracker/index.html`

The daily GitHub Actions workflow will run both:

- `node scripts/daily-update.mjs`
- `node scripts/update-topics.mjs`

and commit updates to:

- `site/index.html`
- `content-captures.html`
- `topics.json`
- `site/social-content-tracker/topics.json`
