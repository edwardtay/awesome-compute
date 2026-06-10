# Contributing to Awesome Compute

Thanks for helping improve the list.

## Before You Submit

Search the README for the project name, repository URL, and close alternatives. A project may already appear in a different category.

Submit one project or one focused editorial change per pull request. This keeps evidence and review decisions clear.

## Inclusion Standard

An entry should normally meet all of these requirements:

- **Practical utility:** It solves a clear compute problem and has a usable quickstart.
- **Maintenance:** It has meaningful activity or releases within the last 12 months.
- **Differentiation:** It gives readers a real reason to choose it over adjacent entries.
- **Adoption evidence:** It has users, contributors, integrations, deployments, or ecosystem support.
- **Documentation:** Installation, architecture, and operational limitations are documented.
- **Governance:** The license, maintainers, releases, and contribution path are clear.
- **List fit:** It belongs in one primary category and improves a compute decision.

GitHub stars are supporting evidence, not an inclusion requirement.

Projects should normally have:

- At least one tagged release.
- At least four months of public history.
- English-language documentation.
- A declared license for source projects.
- A working installation or deployment path.

Exceptions require a short explanation in the pull request. Emerging projects may be accepted when they are uniquely useful and clearly labeled.

## What Belongs Here

- Cluster schedulers and workload managers.
- Distributed execution engines and programming models.
- Serverless, microVM, WebAssembly, and scale-to-zero compute.
- GPU operation, distributed training, and model serving.
- Workflow engines that coordinate compute.
- Container runtimes and workload isolation.
- Compute-focused observability.
- Commercial compute providers with a distinct and usable product.

## What Does Not Belong

- Thin wrappers around an existing entry.
- Projects without usable documentation or a working release.
- Generic cloud products unrelated to compute selection.
- Mining-only cryptocurrency projects.
- Personal scripts and one-off demonstrations.
- Entries submitted primarily for promotion, SEO, or affiliate value.

## Entry Format

Use the existing table format:

```markdown
| [Project](https://github.com/owner/repo) | Best-fit workload | One sentence explaining why it stands out. | One concrete limitation or operational trade-off. |
```

Descriptions must:

- Be one sentence.
- End with a period.
- Explain differentiation rather than repeat the project tagline.
- Avoid unsupported superlatives such as "best", "fastest", or "most scalable".
- State a real trade-off rather than a generic warning.

## Commercial Services

Commercial entries must go in the provider section and include a concrete caveat. Referral or affiliate links are not accepted; link to the official product page.

## Aging and Removal

- Projects with no meaningful activity for 12 months should be reviewed.
- Archived, discontinued, insecure, or unusable projects should be removed.
- A mature and stable project may remain despite low commit frequency when its continued utility is documented.
- Removal proposals should state the reason and allow 14 days for contrary evidence before merging, except for broken or unsafe links.

## Review Model

Automated checks verify objective rules:

- Markdown structure and table shape.
- Duplicate project URLs.
- Internal heading links.
- Required repository files.
- External link health.

Maintainers make the editorial decision:

- Whether the project is genuinely useful.
- Whether it is meaningfully different from existing entries.
- Whether the category and description help a reader choose.
- Whether maintenance, documentation, and adoption evidence are sufficient.
- Whether the stated trade-off is fair and specific.

Passing automation does not guarantee inclusion.

## Category Policy

- A new category should contain at least three strong projects.
- Projects appear once in the primary category; comparison tables may link to them elsewhere.
- Entries are ordered editorially by general decision value, not by stars or alphabetical order.
- Commercial services remain separate from open and source-available projects.

## Pull Request Checklist

- The pull request changes one project or one focused topic.
- The project is not already listed.
- The official URL is used.
- The project is in the correct primary category.
- The description and trade-off follow the list style.
- The submission explains differentiation and maintenance evidence.
- All links work.

## Conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
