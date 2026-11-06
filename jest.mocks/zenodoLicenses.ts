import type { ZenodoLicenseList } from "@/lib/zenodoLicenses";

// A small slice of licenses/zenodo.json from Neurodesk/apps.json.
export const zenodoLicenseFixture: ZenodoLicenseList = {
    licenses: [
        { id: "Apache-2.0", title: "Apache License 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0", osi_approved: true },
        { id: "GPL-3.0-only", title: "GNU General Public License v3.0 only", url: "https://www.gnu.org/licenses/gpl-3.0-standalone.html", osi_approved: true },
        { id: "LGPL-2.1-or-later", title: "GNU Lesser General Public License v2.1 or later", url: "https://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html", osi_approved: true },
        { id: "MIT", title: "MIT License", url: "https://opensource.org/license/mit/", osi_approved: true },
    ],
    deprecated_aliases: { "GPL-3.0": "GPL-3.0-only", "LGPL-2.1+": "LGPL-2.1-or-later" },
};
