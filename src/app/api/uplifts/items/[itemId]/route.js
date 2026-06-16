// Save item - UPDATED
const saveItem = async (item) => {
    try {
        setSavingId(item.id);

        const res = await fetch(`/api/uplifts/${id}/items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: item.content
            })
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || 'Save failed');
        }

        setSavedStates(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => {
            setSavedStates(prev => ({ ...prev, [item.id]: false }));
        }, 2000);

        showModal('success', 'Saved!', 'Section saved successfully.');

    } catch (err) {
        showModal('error', 'Save Failed', err.message);
    } finally {
        setSavingId(null);
    }
};

// Delete item - UPDATED
const deleteItemFromDB = async (itemId) => {
    try {
        const res = await fetch(`/api/uplifts/${id}/items/${itemId}`, {
            method: 'DELETE'
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || 'Delete failed');
        }

        setItems(prev => prev.filter(i => i.id !== itemId));
        showModal('success', 'Deleted!', 'Section deleted successfully.');
    } catch (err) {
        showModal('error', 'Delete Failed', err.message);
    }
};