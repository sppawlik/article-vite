import React, { useEffect, useState } from "react"
import type {Schema} from "../../../amplify/data/resource";
import {generateClient} from "aws-amplify/data";

const client = generateClient<Schema>();


export function ToDo() {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    useEffect(() => {
        client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });
    }, []);

    return (
        <div>

            <div>
                🥳 App successfully hosted. Try creating a new todo.
                <br/>
                <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                    Review next step of this tutorial.
                </a>
            </div>
        </div>
    )
}