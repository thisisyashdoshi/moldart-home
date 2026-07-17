# ChatGPT Subscription Visual Workflow

Use this only for diagrams, editorial visuals, and abstract workflow illustrations. Do not use generated images as factory, staff, customer, lab, or production proof.

This workflow is intentionally subscription-compatible: it uses ChatGPT manually and does not call the OpenAI API.

## Commands

```powershell
npm run images:prompts
```

Then open `docs/chatgpt-image-prompts.md`, copy each prompt into ChatGPT image generation, download the result, and rename the file so it includes the prompt slug. Put downloaded files in:

```powershell
chatgpt-visuals-inbox/
```

Example filenames:

```text
portal-buyer-seller-record.png
process-brief-to-delivery.png
open-wood-science-review.png
contact-rfq-brief.png
```

Import and optimize the downloaded images:

```powershell
npm run images:import
```

## Rules

| Rule    | Requirement                                                                        |
| ------- | ---------------------------------------------------------------------------------- |
| Secrets | No API key is used. Never read `API-KEYS.txt` or `.env` for this workflow.         |
| Model   | Use the newest image generation available inside your ChatGPT subscription.        |
| Usage   | Diagrams, flow visuals, document previews, technical topic cards.                  |
| Avoid   | Fake factories, fake machines, fake staff, fake customer proof, fake lab evidence. |
| Review  | Inspect locally before using generated images in public pages.                     |

Imported files are saved under `images/ai-generated/` and optimized to WebP when `sharp` is available.
