export default async function(input, ctx) {
  const { original_input, description, tags, priority } = input;
  
  // Generate UUID v4 using Math.random() (works in all environments)
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  const id = generateUUID();
  const now = new Date().toISOString();
  const tagsJson = JSON.stringify(tags);
  const sql = `INSERT INTO todo_items (id, original_input, description, tags, priority, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`;
  
  console.log('[TODO_CREATE] Creating task:', { id, description, priority });
  await ctx.env['i:databases-management'].DATABASES_RUN_SQL({
    sql,
    params: [id, original_input, description, tagsJson, priority, now, now]
  });
  
  console.log('[TODO_CREATE] Task created successfully');
  return { id, success: true };
}

// Metadata exports
export const name = "TODO_CREATE";
export const description = "Create a new todo item in the database";
export const inputSchema = {
  "type": "object",
  "properties": {
    "original_input": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "priority": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low"
      ]
    }
  },
  "required": [
    "original_input",
    "description",
    "tags",
    "priority"
  ]
};
export const outputSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "success": {
      "type": "boolean"
    }
  },
  "required": [
    "id",
    "success"
  ]
};
export const dependencies = [
  {
    "integrationId": "i:databases-management",
    "toolNames": [
      "DATABASES_RUN_SQL"
    ]
  }
];