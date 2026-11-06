import "@testing-library/jest-dom";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CopyrightInfo } from "@/components/common";
import { ThemeProvider } from "@/lib/ThemeContext";
import LicenseSection from "../LicenseSection";

const matlab = {
    name: "MATLAB",
    url: "https://www.mathworks.com/products/matlab.html",
};

function renderSection(licenses: CopyrightInfo[], onChange = jest.fn()) {
    render(
        <ThemeProvider defaultTheme="light">
            <LicenseSection licenses={licenses} onChange={onChange} />
        </ThemeProvider>,
    );
    return onChange;
}

describe("LicenseSection", () => {
    it("shows a custom license by name without a Zenodo category", () => {
        renderSection([matlab]);
        expect(screen.getByText("MATLAB")).toBeInTheDocument();
        expect(screen.queryByText("Zenodo license category")).not.toBeInTheDocument();
        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("edits a custom license without changing another license", () => {
        const mit = { license: "MIT" };
        const onChange = renderSection([matlab, mit]);
        fireEvent.change(screen.getByDisplayValue(matlab.url), {
            target: { value: "https://example.com/MATLAB-license" },
        });
        expect(onChange).toHaveBeenLastCalledWith([
            { ...matlab, url: "https://example.com/MATLAB-license" },
            mit,
        ]);
    });

    it("requires a URL for a custom license", () => {
        renderSection([{ name: "Custom license", url: "" }]);
        expect(
            screen.getByText("A custom license requires a URL to the license terms"),
        ).toBeInTheDocument();
    });

    it("requires a name and URL before completing a custom license", () => {
        function EditableSection() {
            const [licenses, setLicenses] = useState<CopyrightInfo[]>([{ license: "", url: "" }]);
            return <LicenseSection licenses={licenses} onChange={setLicenses} />;
        }

        render(
            <ThemeProvider defaultTheme="light">
                <EditableSection />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole("button", { name: /select or search for a license/i }));
        fireEvent.click(screen.getByRole("button", { name: /custom license specify your own license name and url/i }));

        const done = screen.getByRole("button", { name: "Done" });
        expect(done).toBeDisabled();
        fireEvent.change(screen.getByRole("textbox", { name: "Custom license name" }), {
            target: { value: "Custom research license" },
        });
        expect(done).toBeDisabled();
        fireEvent.change(screen.getByRole("textbox", { name: "License URL" }), {
            target: { value: "https://example.com/LICENSE" },
        });
        expect(done).toBeEnabled();
    });

    it("clears SPDX details when switching to a custom license", () => {
        const onChange = renderSection([{ license: "MIT", url: "https://opensource.org/licenses/MIT" }]);
        fireEvent.click(screen.getByRole("button", { name: /MIT - MIT License/i }));
        fireEvent.click(screen.getByRole("button", { name: /custom license specify your own license name and url/i }));
        expect(onChange).toHaveBeenLastCalledWith([{ name: "", url: "" }]);
    });
});
