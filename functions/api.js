export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB; // Recuerda hacer el binding en el panel de Cloudflare con el nombre DB

  // MANEJO DE GET (Leer productos)
  if (request.method === "GET") {
    try {
      const { results } = await db.prepare("SELECT * FROM productos ORDER BY id DESC").all();
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // MANEJO DE POST (Guardar, Editar, Borrar)
  if (request.method === "POST") {
    const data = await request.json();
    
    try {
      if (data.delete_id) {
        await db.prepare("DELETE FROM productos WHERE id = ?").bind(data.delete_id).run();
      } else if (data.edit_id) {
        await db.prepare("UPDATE productos SET nombre=?, precio=?, categoria=?, imagen_url=? WHERE id=?")
          .bind(data.name, data.price, data.cat, data.img, data.edit_id).run();
      } else {
        await db.prepare("INSERT INTO productos (nombre, precio, categoria, imagen_url) VALUES (?, ?, ?, ?)")
          .bind(data.name, data.price, data.cat, data.img).run();
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
