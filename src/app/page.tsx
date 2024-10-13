"use client";

import { useState, useEffect } from "react";

interface Entry {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  ipAddress: string;
}

const ADMIN_IP = "102.187.214.101";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("مستخدم");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userIp, setUserIp] = useState<string>("");

  useEffect(() => {
    fetchEntries();
    fetchUserIp();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/entries");
      const data = await response.json();
      console.log(data);
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const fetchUserIp = async () => {
    try {
      const response = await fetch("/api/userip");
      const data = await response.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error("Error fetching user IP:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, specialization }),
      });
      if (response.ok) {
        fetchEntries();
        setName("");
        setPhone("");
        setSpecialization("");
      }
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setName(entry.name);
    setPhone(entry.phone);
    setSpecialization(entry.specialization);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editingId, name, phone, specialization }),
      });
      if (response.ok) {
        fetchEntries();
        setEditingId(null);
        setName("");
        setPhone("");
        setSpecialization("");
      } else {
        const errorData = await response.json();
        console.error("Error updating entry:", errorData.error);
        alert("You can only edit your own entries.");
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا الإدخال؟")) {
      try {
        const response = await fetch(`/api/entries?id=${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchEntries();
        } else {
          const errorData = await response.json();
          console.error("Error deleting entry:", errorData.error);
          alert("يمكنك فقط حذف إدخالاتك الخاصة.");
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const filteredEntries = entries.filter((entry) =>
    Object.values(entry).some((value) =>
      value.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/[^\d]/g, "");
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const isAdmin = userIp === ADMIN_IP;

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center font-arabic"
      dir="rtl"
    >
      <h1 className="text-3xl font-bold mb-8">إدارة الإدخالات</h1>

      <form
        onSubmit={editingId ? handleUpdate : handleSubmit}
        className="mb-8 w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-700 p-2 rounded text-right"
          />
          <input
            type="tel"
            placeholder="رقم الواتساب"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-gray-700 p-2 rounded text-right"
            required
          />
          <input
            type="text"
            placeholder="التخصص"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="bg-gray-700 p-2 rounded text-right"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? "تحديث الإدخال" : "إضافة إدخال"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
              setPhone("");
              setSpecialization("");
            }}
            className="mt-4 mr-4 bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
          >
            إلغاء التحرير
          </button>
        )}
      </form>

      <div className="mb-4 w-full max-w-4xl">
        <input
          type="text"
          placeholder="البحث في الإدخالات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none bg-gray-700 p-2 rounded text-right"
        />
      </div>

      <table className="w-full max-w-4xl">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2 text-right">الاسم</th>
            <th className="p-2 text-right">الهاتف</th>
            <th className="p-2 text-right">التخصص</th>
            <th className="p-2 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-700">
              <td className="p-2">{entry.name}</td>
              <td className="p-2">
                <button
                  onClick={() => openWhatsApp(entry.phone)}
                  className="text-green-400 hover:text-green-300"
                >
                  {entry.phone}
                </button>
              </td>
              <td className="p-2">{entry.specialization}</td>
              <td className="p-2">
                {(entry.ipAddress === userIp || isAdmin) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-400 hover:text-blue-300 mr-2"
                    >
                      تحرير
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      حذف
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
