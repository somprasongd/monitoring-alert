export async function callAlertApi(payload) {
  try {
    const response = await fetch('/api/alert', {
      method: 'POST',
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
