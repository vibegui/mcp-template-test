export default async function(input, ctx) {
  const { raw_input } = input;
  const result = await ctx.env['i:ai-generation'].AI_GENERATE_OBJECT({messages: [{role: 'system', content: 'Transform user task into JSON with description (string), tags (array of strings), and priority (high/medium/low). Be concise.'}, {role: 'user', content: raw_input}], schema: {type: 'object', properties: {description: {type: 'string'}, tags: {type: 'array', items: {type: 'string'}}, priority: {type: 'string', enum: ['high', 'medium', 'low']}}, required: ['description', 'tags', 'priority']}});
  return result.object;
}

// Metadata exports
export const name = "TODO_AI_ENHANCE";
export const description = "Process raw user input with AI to generate structured task data";
export const inputSchema = {
  "type": "object",
  "properties": {
    "raw_input": {
      "type": "string"
    }
  },
  "required": [
    "raw_input"
  ]
};
export const outputSchema = {
  "type": "object",
  "properties": {
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
    "description",
    "tags",
    "priority"
  ]
};
export const dependencies = [
  {
    "integrationId": "i:ai-generation",
    "toolNames": [
      "AI_GENERATE_OBJECT"
    ]
  }
];