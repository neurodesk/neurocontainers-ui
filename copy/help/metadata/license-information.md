# License Information

Specify licenses for your container and any included software. Each license is published on the container's Zenodo DOI record.

**Options:**
- **Zenodo licenses:** Choose a license from the Zenodo license list. Older SPDX IDs such as `GPL-3.0` are accepted and published as their current ID. If you add a URL, it must link to the terms of that license. List each license as its own entry; expressions such as `MIT OR Apache-2.0` are not accepted.
- **Custom License:** Enter the license title and the URL of its terms. Both are required. A `LicenseRef-` identifier counts as a custom license, so it also needs a name and a URL.
- **No known license:** `NOASSERTION` or `NONE`, with a URL to the software's source. The DOI is then published without a license.

Licenses and URLs must be written out in full; templates such as `{{ context.license }}` are not resolved when the DOI is published.

This is important for legal compliance and distribution.
