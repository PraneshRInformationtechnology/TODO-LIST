import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck , faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Todo() {
    const [title,setTitle]=useState("");
    const [description,setDescription]=useState("");
    const [todos,setTodos] =useState([]);
    const [error,setError] =useState("");
    const [message,setMessage] =useState("");
    const [editId,setEditId] = useState(-1);

    const [editTitle,setEditTitle]=useState("");
    const [editDescription,setEditDescription]=useState("");

    const [doneId,setDoneId]=useState([]);
    const [done,setDone] =useState(-1);

    const apiUrl="http://localhost:8000/"
    const handleSubmit=()=>{
        setError("")
        if(title.trim() !== "" && description.trim() !== ""){
            fetch(apiUrl+"todos",{
                method:"POST",
                headers: {
                    'content-type':'application/json'
                },
                body:JSON.stringify({title,description})
            }).then((res)=>{
                if(res.ok){
                    setTodos([...todos,{title,description}])
                    setMessage("Item added successfully");
                    setTimeout(()=>{
                        setMessage("");
                    },3000)
                    setTitle("");
                    setDescription("");

                }else{
                    setError("Unable to create a todo item")
                }
            }).catch(()=>{
                setError("Unable to create a todo item")
            })
           
        }
        getItem();
    }

    useEffect(()=>{
        getItem()
    },[])

    const getItem=()=>{
        fetch(apiUrl+"todos")
        .then((res)=>{
            return res.json()
        })
        .then((res)=>{
            setTodos(res)
        })
    }
    const handleEdit=(item)=>{
        setEditId(item._id);
        setEditTitle(item.title);
        setEditDescription(item.description);
    }

    const handleUpdate=() => {
        setError("")
        if(editTitle.trim() !== "" && editDescription.trim() !== ""){
            fetch(apiUrl+"todos/"+editId,{
                method:"PUT",
                headers: {
                    'content-type':'application/json'
                },
                body:JSON.stringify({title : editTitle,description : editDescription})
            }).then((res)=>{
                if(res.ok){
                   const updatedTodos = todos.map((item)=>{
                      if(item._id == editId){
                        item.title=editTitle;
                        item.description=editDescription;
                      }  
                      return item;
                    })
                    setTodos(updatedTodos)
                    setMessage("Item Updated successfully");
                    setTimeout(()=>{
                        setMessage("");
                    },3000)
                    setEditId(-1);

                }else{
                    setError("Unable to update todo item")
                }
            }).catch(()=>{
                setError("Unable to update todo item")
            })
           
        }
    }

    const handleEditCancel=()=>{
        setEditId(-1);
    }

    const handleDelete=(id)=>{
        if(window.confirm('Are you sure want to delete ?')){

            fetch(apiUrl+"todos/"+id,{
                method : "DELETE"
            })
            .then(() =>{
                const updatedTodos = todos.filter((item) => item._id != id)
                setTodos(updatedTodos)
            })
        }
    }
    const handleMark = (id) => {
        if (!doneId.includes(id)) {
            setDoneId((prevDoneId) => [...prevDoneId, id]);
        }
        console.log(doneId);
        const parent = document.getElementById(id);
        if (parent) {
            parent.classList.remove("bg-info");
            parent.classList.add("bg-primary");
            setDone(id);
        }
    };

    const handleNo = (id) => {
        setDoneId((prevDoneId) => prevDoneId.filter((ele) => ele !== id));
        console.log(doneId);
        const parent = document.getElementById(id);
        if (parent) {
            parent.classList.remove("bg-success");
            parent.classList.add("bg-info");
            setDone(-1);
        }
    };
    return <> <div className="row p-3 bg-success text-light">
            <h1 className="text-center">TO-DO LIST</h1>
        </div>
        <div className="row">
            <h3>Add Item</h3>
            {message && <p className="text-success"> {message}</p>}
            <div className="form-group d-flex gap-2">
            <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" type="text"/>
            <input className="form-control" value={description} onChange={(e)=>setDescription(e.target.value)}placeholder="Description" type="text"/>
            <button className="btn btn-dark" onClick={handleSubmit}>Submit</button>
            </div>
            {error && <p className="text-danger">{error}</p>}
        </div>
        <div className="row mt-3">
            <h1>Tasks</h1>
            <ul className="list-group" >
                {
                    todos.map((item)=><li id={item._id} className="list-group-item bg-info d-flex justify-content-between align-items-center my-2">
                    <div className="d-flex flex-column text-wrap">
                        { editId == -1 || editId !== item._id ? <>
                            <span className="fw-bold">{item.title}</span>
                            <span >{item.description}</span>
                        </>:<div className="d-flex me-2 gap-3">
                        <input className="form-control" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} placeholder="Title" type="text"/>
                        <input className="form-control" value={editDescription} onChange={(e)=>setEditDescription(e.target.value)}placeholder="Description" type="text"/>
                        </div>
                        }
                    </div>
                    <div className="d-flex gap-3 justify-content-center align-items-center">
                        {doneId.includes(item._id) && <button className="btn btn-primary text-light fw-bold">Completed</button>}
                       {(done == -1 || done !==item._id)&& !doneId.includes(item._id) ?<button className="btn btn-success" onClick={() => handleMark(item._id)}><FontAwesomeIcon icon={faCheck} /></button>
                        :<button className="btn btn-danger" onClick={() => handleNo(item._id)}><FontAwesomeIcon icon={faXmark} /></button>}
                       { !doneId.includes(item._id) ?(editId == -1 || editId !== item._id ? <button className="btn btn-warning" onClick={() =>handleEdit(item)}>EDIT</button>:<button className="btn btn-warning"onClick={handleUpdate}>Update</button>):<></>}
                        { editId == -1 || editId !== item._id?<button className="btn btn-danger" onClick={()=>handleDelete(item._id)}>DELETE</button>:<button className="btn btn-danger" onClick={handleEditCancel}>Cancel</button>}
                    </div>
                   
                </li>)
                }
            </ul>
        </div>
        </>
}