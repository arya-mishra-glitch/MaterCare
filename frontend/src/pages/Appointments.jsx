import { useState } from "react";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    doctor: "",
    date: "",
    hospital: "",
  });

  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddOrUpdate = () => {
    if (!form.doctor || !form.date || !form.hospital) {
      alert("Please fill all fields");
      return;
    }

    if (editIndex !== null) {
      // UPDATE
      const updated = [...appointments];
      updated[editIndex] = form;
      setAppointments(updated);
      setEditIndex(null);
    } else {
      // ADD
      setAppointments([...appointments, form]);
    }

    setForm({
      doctor: "",
      date: "",
      hospital: "",
    });
  };

  const handleDelete = (index) => {
    const updated = appointments.filter((_, i) => i !== index);
    setAppointments(updated);
  };

  const handleEdit = (index) => {
    setForm(appointments[index]);
    setEditIndex(index);
  };

  return (
    <div style={styles.container}>
      <h2>Appointments</h2>

      {/* Form */}
      <div style={styles.form}>
        <input
          type="text"
          name="doctor"
          placeholder="Doctor Name"
          value={form.doctor}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="hospital"
          placeholder="Hospital"
          value={form.hospital}
          onChange={handleChange}
          style={styles.input}
        />

        <button onClick={handleAddOrUpdate} style={styles.button}>
          {editIndex !== null ? "Update" : "Add"}
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: "20px" }}>
        {appointments.length === 0 ? (
          <p>No appointments yet</p>
        ) : (
          appointments.map((appt, index) => (
            <div key={index} style={styles.card}>
              <p><b>Doctor:</b> {appt.doctor}</p>
              <p><b>Date:</b> {appt.date}</p>
              <p><b>Hospital:</b> {appt.hospital}</p>

              <div style={styles.actions}>
                <button onClick={() => handleEdit(index)} style={styles.edit}>
                  Edit
                </button>
                <button onClick={() => handleDelete(index)} style={styles.delete}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },

  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "10px 15px",
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },

  edit: {
    padding: "5px 10px",
    background: "#3B82F6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  delete: {
    padding: "5px 10px",
    background: "#EF4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Appointments;