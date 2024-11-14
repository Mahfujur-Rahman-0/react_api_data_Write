import axios from "axios";
import { useEffect, useState } from "react";

const TextManager = () => {
	const [data, setData] = useState([]);
	const [title, setTitle] = useState("");
	const [text, setText] = useState("");
	const [editIndex, setEditIndex] = useState(null);
	const [errr, setErr] = useState();
	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await axios.get("http://localhost:8000/Posts");

				if (response && response.data) {
					setData(response.data);
				}
			} catch (err) {
				console.log(err);
				if (err.response) {
					setErr(
						`Error from server: status: ${err.response.status} - message:${err.response.data}`
					);
				} else {
					setErr(err.message);
				}
			}
		};
		fetchPost();
	}, []);
	// Function to add or update data
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (editIndex !== null) {
			// Edit mode
			try {
				// Create a copy of the data with the updated item
				const updatedData = data.map((item, index) =>
					index === editIndex ? { ...item, title, text } : item
				);

				// Get the actual id of the item being edited
				const patchID = data[editIndex].id;

				// Send only the updated item to the server
				await axios.patch(`http://localhost:8000/Posts/${patchID}`, {
					title,
					text,
				});

				// Update the state with the modified data
				setData(updatedData);
				setEditIndex(null); // Reset edit index
			} catch (err) {
				if (err.response) {
					setErr(
						`Error from server: status: ${err.response.status} - message: ${err.response.data}`
					);
				} else {
					setErr(err.message);
				}
			}
		} else {
			// Add mode
			try {
				const stId = data.length + 1;
				const newItem = { id: stId.toString(), title, text };

				// POST request to the server
				await axios.post("http://localhost:8000/Posts", newItem);

				// Append the new item to the existing array
				setData([...data, newItem]); // Corrected this line
			} catch (err) {
				if (err.response) {
					setErr(
						`Error from server: status: ${err.response.status} - message: ${err.response.data}`
					);
				} else {
					setErr(err.message);
				}
			}
		}

		setTitle("");
		setText("");
	};

	// Function to delete an item
	const handleDelete = async (index) => {
		try {
			const itemId = data[index].id; // Retrieve the actual id of the item to delete
			await axios.delete(`http://localhost:8000/Posts/${itemId}`); // Corrected URL

			// Remove the item from local state
			const updatedData = data.filter((_, i) => i !== index);
			setData(updatedData);
		} catch (err) {
			if (err.response) {
				setErr(
					`Error from server: status: ${err.response.status} - message: ${err.response.data}`
				);
			} else {
				setErr(err.message);
			}
		}
	};

	// Function to set up editing mode
	const handleEdit = (index) => {
		setEditIndex(index);
		setTitle(data[index].title);
		setText(data[index].text);
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<br />
				<br />
				<input
					type="text"
					placeholder="Text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					required
				/>
				<button type="submit">{editIndex !== null ? "Update" : "Add"}</button>
			</form>

			<div>
				{data.map((item, index) => (
					<div key={item.id}>
						<p>{` ${item.id} ${item.title} age:${item.text}`}</p>
						<button onClick={() => handleEdit(index)}>Edit</button>
						<button onClick={() => handleDelete(index)}>Delete</button>
					</div>
				))}
			</div>
			<br />
			<br />
			{errr && (
				<>
					<hr />
					<div className="error">{errr}</div>
				</>
			)}
		</div>
	);
};

export default TextManager;
