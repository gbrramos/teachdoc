export default function Input(props: React.InputHTMLAttributes<HTMLInputElement> &  { onChange?: (value?: any) => void }) {

    return (
        <input
            {...props}
            onChange={props.onChange}
            className="px-4 py-2 text-black border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        />
    );
}