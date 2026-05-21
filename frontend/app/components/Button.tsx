import type { ButtonHTMLAttributes } from "react";

export default function Button(
    props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }
) {
    const { variant } = props;
    return (
        <button className={`px-4 py-2 rounded 
            ${variant === "secondary" ? "bg-gray-500 text-white" : variant === "ghost" ? "bg-transparent text-gray-500" : "bg-blue-500 text-white"}
            `} {...props}>
            {props.children}
        </button>
    );
}