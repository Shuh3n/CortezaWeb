require('dotenv').config({ path: '../.env' });
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const server = new Server({
  name: "supabase-mcp-server-hybrid",
  version: "1.1.0",
}, {
  capabilities: {
    tools: {},
  },
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const pat = process.env.SUPABASE_ACCESS_TOKEN_CORTEZWEB || "";
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];

// Cliente para Datos e Introspección (vía PostgREST)
const supabase = createClient(supabaseUrl, anonKey);

// Cliente para Gestión (vía api.supabase.com)
const managementApi = axios.create({
  baseURL: 'https://api.supabase.com/v1',
  headers: {
    'Authorization': `Bearer ${pat}`,
    'Content-Type': 'application/json'
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_tables",
        description: "List all tables in the public schema",
      },
      {
        name: "run_query",
        description: "Execute arbitrary SQL query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The SQL query to run" },
          },
          required: ["query"],
        },
      },
      {
        name: "deploy_function",
        description: "Deploy an Edge Function",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The function slug" },
            code: { type: "string", description: "The function code (Deno JS/TS)" },
          },
          required: ["slug", "code"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_tables": {
        // Usamos el spec de PostgREST que es lo más confiable para listar tablas expuestas
        const { data, error } = await supabase.from('__non_existent_table__').select('*').limit(0);
        // Nota: Una forma mejor de introspección es pegarle a la raíz del endpoint REST
        const restRes = await axios.get(`${supabaseUrl}/rest/v1/`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        const tables = Object.keys(restRes.data.definitions || {}).map(t => ({ name: t }));
        return { content: [{ type: "text", text: JSON.stringify(tables, null, 2) }] };
      }
      case "run_query": {
        return { 
          content: [{ 
            type: "text", 
            text: "Para ejecutar SQL directo, te recomiendo usar el cliente de Postgres o RPC (supabase.rpc). La Management API es limitada para SQL arbitrario." 
          }] 
        };
      }
      case "deploy_function": {
        if (!pat) throw new Error("PAT not found");
        const res = await managementApi.post(`/projects/${projectRef}/functions`, {
          slug: args.slug,
          name: args.slug,
          body: args.code,
          verify_jwt: true
        });
        return { content: [{ type: "text", text: `Function ${args.slug} deployed: ${JSON.stringify(res.data)}` }] };
      }
      default:
        throw new Error(`Tool ${name} not found`);
    }
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.response?.data?.message || err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Supabase MCP Server (Hybrid) running on stdio");
}

main().catch(console.error);
