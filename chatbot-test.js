async function main() {
  const url = 'http://localhost:8083/api/chatbot/student';
  const body = {
    message: 'What courses are available and what is the price of JAVA101?',
    history: [],
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  console.log('status', r.status);
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
