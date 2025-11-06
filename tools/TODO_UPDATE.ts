export default async function(input, ctx) {
  const { id, completed, description, tags, priority } = input;
  const now = new Date().toISOString();
  let updates = [];
  let params = [];
  if (completed !== undefined) { updates.push('completed = ?'); params.push(completed ? 1 : 0); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);
  const sql = `UPDATE todo_items SET ${updates.join(', ')} WHERE id = ?`;
  
  console.log('[TODO_UPDATE] Updating task:', id);
  await ctx.env['i:databases-management'].DATABASES_RUN_SQL({
    sql,
    params
  });
  
  console.log('[TODO_UPDATE] Task updated successfully');
  return { success: true };
}

// Metadata exports
export const name = "TODO_UPDATE";
export const description = "Update a task's fields";
export const inputSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "completed": {
      "type": "boolean"
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
    "id"
  ]
};
export const outputSchema = {
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    }
  },
  "required": [
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