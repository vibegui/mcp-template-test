export default async function(input, ctx) {
  const { id } = input;
  const sql = `DELETE FROM todo_items WHERE id = ?`;
  
  console.log('[TODO_DELETE] Deleting task:', id);
  await ctx.env['i:databases-management'].DATABASES_RUN_SQL({
    sql,
    params: [id]
  });
  
  console.log('[TODO_DELETE] Task deleted successfully');
  return { success: true, id };
}

// Metadata exports
export const name = "TODO_DELETE";
export const description = "Delete a task";
export const inputSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
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
    },
    "id": {
      "type": "string"
    }
  },
  "required": [
    "success",
    "id"
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