import { useCallback, useState } from "react";
import "./App.css";
import { downloadAndParse } from "./data";

function App() {
	async function run() {
		let locations = await downloadAndParse();
		console.log(locations);
	}

	run();

	const [count, setCount] = useState(0);

	const handleClick = useCallback(() => {
		setCount((prevState) => prevState + 1);
	}, [setCount]);

	return (
		<div className="App">
			<span>{count}</span>
			<button onClick={handleClick}>Increment</button>
		</div>
	);
}

export default App;
