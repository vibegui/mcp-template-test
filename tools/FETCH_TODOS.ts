export default async function(input, ctx) {
  const { include_completed = true } = input;
  
  let sql = `SELECT id, description, priority, tags, completed, created_at, updated_at FROM todo_items`;
  if (!include_completed) sql += ` WHERE completed = 0`;
  sql += ` ORDER BY CASE WHEN priority = 'high' THEN 0 WHEN priority = 'medium' THEN 1 ELSE 2 END, completed ASC, created_at DESC`;
  
  const result = await ctx.env['i:databases-management'].DATABASES_RUN_SQL({sql});
  
  if (!result.result[0] || !result.result[0].results) {
    return { tasks: [], total: 0 };
  }
  
  const tasks = result.result[0].results.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
    completed: row.completed === 1 || row.completed === true
  }));
  
  return { tasks, total: tasks.length };
}

// Metadata exports
export const name = "FETCH_TODOS";
export const description = "Fetch all todo items from the database, sorted by priority and date";
export const inputSchema = {
  "type": "object",
  "properties": {
    "include_completed": {
      "type": "boolean",
      "default": true,
      "description": "Whether to include completed tasks"
    }
  },
  "additionalProperties": false
};
export const outputSchema = {
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "low",
              "medium",
              "high"
            ]
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "completed": {
            "type": "boolean"
          },
          "created_at": {
            "type": "string"
          },
          "updated_at": {
            "type": "string"
          }
        }
      }
    },
    "total": {
      "type": "number"
    }
  },
  "required": [
    "tasks",
    "total"
  ],
  "additionalProperties": false
};
export const dependencies = [
  {
    "integrationId": "i:databases-management",
    "toolNames": [
      "DATABASES_RUN_SQL"
    ]
  }
];