export async function callApi(payload) {
  try {
    const response = await fetch('/api/alert', {
      method: 'POST',
      // mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return { result };
  } catch (error) {
    return { error };
  }
}
