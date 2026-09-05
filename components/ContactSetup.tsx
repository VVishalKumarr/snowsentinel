"use client";

import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/AppStateContext";

export default function ContactSetup() {
  const { trustedContacts, addTrustedContact, removeTrustedContact } = useAppState();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactMethod, setContactMethod] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTrustedContact({ name: name.trim(), relationship: relationship.trim() || "Contact", contactMethod: contactMethod.trim() });
    setName("");
    setRelationship("");
    setContactMethod("");
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <h2 className="mb-1 text-sm font-semibold tracking-wide text-slate-800">YOUR SAFETY NETWORK</h2>
      <p className="mb-4 text-xs text-slate-500">
        Add trusted contacts who will receive your SOS alert. Stored only on this device for this
        prototype.
      </p>

      <form onSubmit={handleSave} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
        />
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Relationship"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
        />
        <input
          value={contactMethod}
          onChange={(e) => setContactMethod(e.target.value)}
          placeholder="Phone / contact method"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <UserPlus className="h-3.5 w-3.5" /> SAVE CONTACT
        </button>
      </form>

      {trustedContacts.length === 0 ? (
        <p className="text-xs text-slate-400">No trusted contacts yet — the SOS button will fall back to your Family Safety list.</p>
      ) : (
        <div className="space-y-2">
          {trustedContacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="text-sm text-slate-700">
                <span className="font-medium">{c.name}</span>{" "}
                <span className="text-xs text-slate-400">
                  ({c.relationship}
                  {c.contactMethod ? ` · ${c.contactMethod}` : ""})
                </span>
              </div>
              <button onClick={() => removeTrustedContact(c.id)} className="text-slate-400 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
