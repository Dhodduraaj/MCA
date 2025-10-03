import { format, getDay, parse, parseISO, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiEdit,
  FiRefreshCcw,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

// Helper functions
const daysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

const getNextDueDate = (dueDate, recurring) => {
  const date = new Date(dueDate);
  switch (recurring) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }
  return date.toISOString().split("T")[0];
};

// Big Calendar localizer
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarPage() {
  const [payments, setPayments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    dueDate: "",
    recurring: "none",
    paid: false,
  });

  // Load & Save payments
  useEffect(() => {
    setPayments(JSON.parse(localStorage.getItem("payments")) || []);
  }, []);
  useEffect(() => {
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [payments]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.amount || !form.dueDate) return;
    if (editPayment) {
      setPayments(
        payments.map((p) =>
          p.id === editPayment.id ? { ...form, id: editPayment.id } : p
        )
      );
      setEditPayment(null);
    } else {
      setPayments([...payments, { ...form, id: crypto.randomUUID() }]);
    }
    setForm({
      name: "",
      amount: "",
      dueDate: "",
      recurring: "none",
      paid: false,
    });
    setModalOpen(false);
  };

  const handleDelete = (id) =>
    setPayments(payments.filter((p) => p.id !== id));
  const handleEdit = (payment) => {
    setEditPayment(payment);
    setForm(payment);
    setModalOpen(true);
  };

  const markAsPaid = (payment) => {
    setPayments((prev) => [
      ...prev.map((p) =>
        p.id === payment.id ? { ...p, paid: true } : p
      ),
      ...(payment.recurring !== "none"
        ? [
            {
              ...payment,
              id: crypto.randomUUID(),
              dueDate: getNextDueDate(payment.dueDate, payment.recurring),
              paid: false,
            },
          ]
        : []),
    ]);
  };

  // Progress
  const today = new Date();
  const totalThisMonth = payments.filter(
    (p) => new Date(p.dueDate).getMonth() === today.getMonth()
  );
  const completed = totalThisMonth.filter((p) => p.paid).length;
  const progress = totalThisMonth.length
    ? (completed / totalThisMonth.length) * 100
    : 0;

  const sortedPayments = useMemo(
    () =>
      [...payments].sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      ),
    [payments]
  );

  // Events for BigCalendar
  const events = payments.map((p) => ({
    id: p.id,
    title: p.name,
    start: parseISO(p.dueDate),
    end: parseISO(p.dueDate),
    allDay: true,
    paid: p.paid,
    amount: p.amount,
    remaining: daysRemaining(p.dueDate),
  }));

  const paymentsByDate = useMemo(() => {
    return payments.reduce((acc, p) => {
      const key = new Date(p.dueDate).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
  }, [payments]);

  const nextPayment = sortedPayments.find((p) => !p.paid);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-screen min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc] pt-16"
    >
      {/* Calendar */}
      <div
        className="w-full lg:w-[70%] flex-1 p-4"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        <div className="h-full bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ flex: 1 }}
            views={["month", "week", "day"]}
            selectable
            onSelectSlot={(slotInfo) => {
              setForm({
                ...form,
                dueDate: slotInfo.start.toISOString().split("T")[0],
                recurring: "none",
                paid: false,
              });
              setEditPayment(null);
              setModalOpen(true);
            }}
            onSelectEvent={(event) =>
              handleEdit(payments.find((p) => p.id === event.id))
            }
            eventPropGetter={() => ({ style: { display: "none" } })}
            components={{
              month: {
                dateHeader: ({ date, label }) => {
                  const dayPayments =
                    paymentsByDate[date.toDateString()] || [];
                  return (
                    <div className="relative h-full flex flex-col items-center">
                      <div className="text-sm font-medium">{label}</div>
                      {dayPayments.length > 0 && (
                        <div className="mt-auto w-full flex flex-col gap-1 px-1 pb-1">
                          {dayPayments.map((p) => (
                            <div
                              key={p.id}
                              title={`${p.name} - ₹${p.amount} (${
                                p.paid ? "Paid" : "Pending"
                              })`}
                              className={`text-xs text-white rounded-md px-1 py-0.5 truncate text-center ${
                                p.paid
                                  ? "bg-green-500"
                                  : daysRemaining(p.dueDate) < 3
                                  ? "bg-red-500"
                                  : daysRemaining(p.dueDate) < 7
                                  ? "bg-yellow-500 text-black"
                                  : "bg-blue-500"
                              }`}
                            >
                              {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              },
            }}
            popup
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[25%] flex flex-col gap-6 p-4">
        <div className="flex-1 bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col">
          <h2 className="font-bold text-lg mb-4 flex justify-between items-center">
            Scheduled Payments
            <button
              onClick={() => {
                setForm({
                  name: "",
                  amount: "",
                  dueDate: "",
                  recurring: "none",
                  paid: false,
                });
                setEditPayment(null);
                setModalOpen(true);
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
            >
              + Add
            </button>
          </h2>

          {nextPayment && (
            <div className="bg-yellow-100 rounded-lg p-2 mb-3 shadow flex items-center justify-between">
              <span>
                🔥 Next: {nextPayment.name} - ₹{nextPayment.amount}
              </span>
              <span className="text-xs text-gray-600">
                {daysRemaining(nextPayment.dueDate)} days left
              </span>
            </div>
          )}

          <ul className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-24rem)] pr-2">
            {sortedPayments.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between items-center p-3 rounded-lg shadow transition-colors ${
                  daysRemaining(p.dueDate) < 3
                    ? "bg-red-100"
                    : daysRemaining(p.dueDate) < 7
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">
                    ₹{parseFloat(p.amount)} - Due in{" "}
                    {daysRemaining(p.dueDate)} days
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.paid ? "Paid" : "Pending"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!p.paid && (
                    <button
                      onClick={() => markAsPaid(p)}
                      className="text-green-500 hover:underline flex items-center gap-1"
                    >
                      <FiCheckCircle /> Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:underline flex items-center gap-1"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-32 bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col justify-center">
          <h2 className="font-bold text-lg mb-2">This Month Progress</h2>
          <p className="text-sm mb-2">
            {completed}/{totalThisMonth.length} payments completed
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-green-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-lg flex flex-col gap-6 p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setModalOpen(false);
                setEditPayment(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FiX size={20} />
            </button>

            {/* Title */}
            <h3 className="font-extrabold text-2xl text-center text-gray-800">
              {editPayment ? "Edit Payment" : "Add New Payment"}
            </h3>
            <p className="text-sm text-gray-500 text-center -mt-3">
              {editPayment
                ? "Update your existing payment details."
                : "Fill in the details to schedule a new payment."}
            </p>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <FiTag className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Bill Name"
                  value={form.name}
                  onChange={handleChange}
                  className="border pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 transition"
                />
              </div>

              <div className="relative">
                <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="border pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 transition"
                />
              </div>

              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="border pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition"
                />
              </div>

              <div className="relative">
                <FiRefreshCcw className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="recurring"
                  value={form.recurring}
                  onChange={handleChange}
                  className="border pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition"
                >
                  <option value="none">No Recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditPayment(null);
                }}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default CalendarPage;
