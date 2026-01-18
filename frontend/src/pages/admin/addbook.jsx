import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = "import.meta.env.VITE_API_URL";

const AddBookForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "coverImage") {
          if (value && value[0]) {
            formData.append("coverImage", value[0]);
          }
        } else {
          formData.append(key, value?.toString().trim());
        }
      });

      // ✅ FIXED TOKEN KEY
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        `${SERVER_URL}/books/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { error, message } = res.data;

      if (error) showErrorToast(message);
      else {
        showSuccessToast(message);
        reset();
      }

    } catch (err) {
      console.error("ADD BOOK ERROR 👉", err.response?.data || err.message);
      showErrorToast(err.response?.data?.message || "Failed to add book!");
    }
  };



  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📚 Add a New Book</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 shadow-sm bg-light rounded"
      >
        <div className="mb-3">
          <label className="form-label">Book Title</label>
          <input
            type="text"
            className="form-control"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <small className="text-danger">{errors.title.message}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            {...register("author", { required: "Author is required" })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            // {...register("category", { required: "Category is required" })}
            {...register("category", { required: "Category is required" })}

          >
            <option value="">Select Category</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-fiction">Non-fiction</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">ISBN</label>
          <input
            type="text"
            className="form-control"
            {...register("isbn", { required: "ISBN is required" })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Book Cover Image</label>
          <input
            type="file"
            className="form-control"
            {...register("coverImage")}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Total Copies</label>
          <input
            type="number"
            className="form-control"
            {...register("totalCopies", { required: true, min: 1 })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            {...register("price", { required: true })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            {...register("description", {
              required: "Description is required",
            })}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Add Book
        </button>
      </form>
    </div>
  );
};

export default AddBookForm;
