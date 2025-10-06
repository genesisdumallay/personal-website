const runGroq = async (messages = [{ role: 'user', content: 'Hello, how are you?' }]) => {
    try {
        console.debug('[runGroq] sending request with messages:', messages);
        const res = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
        });

        let payload: unknown = null;
        try {
            payload = await res.json();
        } catch (e) {
            // non-json response
            console.warn('[runGroq] response is not JSON', e);
        }

        if (!res.ok) {
            console.error('[runGroq] Groq API error:', payload ?? { status: res.status, statusText: res.statusText });
            return null;
        }

        console.debug('[runGroq] received payload:', payload);
        if (payload && typeof payload === 'object' && 'result' in payload) {
            return (payload as unknown as { result?: unknown }).result ?? null;
        }
        return null;
    } catch (err) {
        console.error('runGroq fetch failed:', err);
        return null;
    }
};

export default runGroq;