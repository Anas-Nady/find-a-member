"use client";

import { useState, useEffect } from "react";

interface Entry {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  ipAddress: string;
}

type LoadingState = "idle" | "loading" | "loaded" | "error";

const ADMIN_IP = "102.187.214.101";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("مستخدم");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userIp, setUserIp] = useState<string>("");

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const specializations = [
    "React",
    "Angular",
    "Node.js",
    ".NET",
    "PHP",
    "Flutter",
    "UI/UX",
    "React Native",
    "AI",
    "Data Analysis",
    "Embedded Systems",
    "Security",
    "Network",
    "Penetration Testing",
  ];

  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  useEffect(() => {
    fetchEntries();
    fetchUserIp();
  }, []);

  const fetchEntries = async () => {
    setLoadingState("loading");
    try {
      const response = await fetch("/api/entries");
      const data = await response.json();
      console.log(data);
      setEntries(data);
      setLoadingState("loaded");
    } catch (error) {
      console.error("Error fetching entries:", error);
      setLoadingState("error");
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

  const validateInputs = () => {
    let isValid = true;

    // Validate name
    if (name.length < 4 || name.length > 30) {
      setNameError("يجب أن يكون الاسم بين 4 و 30 حرفًا");
      isValid = false;
    } else {
      setNameError("");
    }

    // Validate phone (WhatsApp number)
    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("يجب أن يكون رقم الواتساب 11 رقمًا بالضبط");
      isValid = false;
    } else {
      setPhoneError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
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
    if (!validateInputs()) {
      return;
    }
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
      className="flex flex-col items-center min-h-screen p-8 text-white bg-gray-900 font-arabic"
      dir="rtl"
    >
      <h1 className="mb-8 text-3xl font-bold">إدارة الإدخالات</h1>

      <form
        onSubmit={editingId ? handleUpdate : handleSubmit}
        className="w-full max-w-6xl mb-8"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <input
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-right bg-gray-700 rounded"
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-500">{nameError}</p>
            )}
          </div>
          <div>
            <input
              type="tel"
              placeholder="رقم الواتساب (11 رقم)"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              className="w-full p-2 text-right bg-gray-700 rounded"
              required
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-500">{phoneError}</p>
            )}
          </div>
          <div>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full p-2 text-right bg-gray-700 rounded"
              required
            >
              <option value="">اختر التخصص</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 mt-4 bg-blue-500 rounded hover:bg-blue-600"
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
            className="px-4 py-2 mt-4 mr-4 bg-gray-500 rounded hover:bg-gray-600"
          >
            إلغاء التحرير
          </button>
        )}
      </form>

      <div className="w-full max-w-4xl mb-4">
        <input
          type="text"
          placeholder="البحث في الإدخالات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 text-right bg-gray-700 rounded focus:outline-none"
        />
      </div>

      {loadingState === "loading" && (
        <div className="flex items-center justify-center my-8">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {loadingState === "error" && (
        <div className="my-8 text-red-500">
          حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      )}

      {loadingState === "loaded" && (
        <div className="w-full max-w-4xl overflow-x-auto" dir="rtl">
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
                          className="mr-2 text-blue-400 hover:text-blue-300"
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
      )}
    </div>
  );
}
