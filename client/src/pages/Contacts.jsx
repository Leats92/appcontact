import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getContacts();
      setItems(res);
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (c) =>
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s)
    );
  }, [q, items]);

  const submitNew = async (e) => {
    e.preventDefault();
    try {
      await api.createContact({ firstName, lastName, phone });
      setFirstName('');
      setLastName('');
      setPhone('');
      await load();
    } catch (e) {
      alert(e.message || 'Erreur création');
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditFirst(c.firstName);
    setEditLast(c.lastName);
    setEditPhone(c.phone);
  };

  const saveEdit = async (id) => {
    try {
      await api.updateContact(id, { firstName: editFirst, lastName: editLast, phone: editPhone });
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.message || 'Erreur mise à jour');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce contact ?')) return;
    try {
      await api.deleteContact(id);
      await load();
    } catch (e) {
      alert(e.message || 'Erreur suppression');
    }
  };

  return (
    <div>
      <h2>Mes contacts</h2>
      <div className="toolbar">
        <input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <form className="form row" onSubmit={submitNew}>
        <input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <button className="btn">Ajouter</button>
      </form>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filtered.length === 0 ? (
        <div>Aucun contact</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id}>
                <td>
                  {editingId === c._id ? (
                    <input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
                  ) : (
                    c.firstName
                  )}
                </td>
                <td>
                  {editingId === c._id ? (
                    <input value={editLast} onChange={(e) => setEditLast(e.target.value)} />
                  ) : (
                    c.lastName
                  )}
                </td>
                <td>
                  {editingId === c._id ? (
                    <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  ) : (
                    c.phone
                  )}
                </td>
                <td>
                  {editingId === c._id ? (
                    <>
                      <button className="btn" onClick={() => saveEdit(c._id)}>Enregistrer</button>
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Annuler</button>
                    </>
                  ) : (
                    <>
                      <button className="btn" onClick={() => startEdit(c)}>Éditer</button>
                      <button className="btn btn-danger" onClick={() => remove(c._id)}>Supprimer</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
