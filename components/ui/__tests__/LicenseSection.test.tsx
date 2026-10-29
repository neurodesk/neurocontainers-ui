import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { CopyrightInfo } from "@/components/common";
import { ThemeProvider } from "@/lib/ThemeContext";
import LicenseSection from "../LicenseSection";

const matlab = {
    license: "other-closed",
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
    it("shows a custom license by name with its Zenodo category", () => {
        renderSection([matlab]);
        expect(screen.getByText("MATLAB")).toBeInTheDocument();
        expect(screen.getByDisplayValue("other-closed (restricted terms)")).toBeInTheDocument();
        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("keeps the name and URL when the Zenodo category changes", () => {
        const onChange = renderSection([matlab]);
        fireEvent.change(screen.getByDisplayValue("other-closed (restricted terms)"), {
            target: { value: "" },
        });
        expect(onChange).toHaveBeenLastCalledWith([{ name: matlab.name, url: matlab.url }]);
    });

    it("does not add a name when switching the category of a nameless entry", () => {
        const url = "https://example.com/LICENSE";
        const onChange = renderSection([{ license: "other-open", url }]);
        fireEvent.change(screen.getByDisplayValue("other-open (open terms)"), {
            target: { value: "other-closed" },
        });
        expect(onChange).toHaveBeenLastCalledWith([{ license: "other-closed", url }]);
    });

    it("requires a URL for a custom license", () => {
        renderSection([{ name: "Custom license", url: "" }]);
        expect(
            screen.getByText("A custom license requires a URL to the license terms"),
        ).toBeInTheDocument();
    });
});
