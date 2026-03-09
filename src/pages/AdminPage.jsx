import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const ORDER_STATUS_OPTIONS = [
  { value: "CHO_XU_LY", label: "Chờ xử lý" },
  { value: "DA_LIEN_HE", label: "Đã liên hệ" },
  { value: "DANG_GIAO", label: "Đang giao" },
  { value: "HOAN_THANH", label: "Hoàn thành" },
  { value: "HUY", label: "Đã hủy" },
];

function AdminPage() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [searchCategory, setSearchCategory] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");

  const [toast, setToast] = useState(null);

  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    tenDanhMuc: "",
    moTa: "",
    trangThai: true,
  });

  const [productForm, setProductForm] = useState({
    tenSanPham: "",
    danhMucId: "",
    gia: "",
    donViTinh: "",
    moTa: "",
    soLuongTon: "",
    trangThai: true,
  });

  const [imageForm, setImageForm] = useState({
    sanPhamId: "",
    file: null,
  });

  const [orderForm, setOrderForm] = useState({
    trangThai: "CHO_XU_LY",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [categoryRes, productRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/danh-muc/all`),
        axios.get(`${API_BASE_URL}/san-pham/all`),
        axios.get(`${API_BASE_URL}/don-hang`),
      ]);

      setCategories(categoryRes.data || []);
      setProducts(productRes.data || []);
      setOrders(orderRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Không tải được dữ liệu từ backend", "error");
    } finally {
      setLoading(false);
    }
  };

  const imageCount = useMemo(
    () => products.filter((p) => p.duongDanAnh).length,
    [products]
  );

  const filteredCategories = useMemo(() => {
    const q = searchCategory.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.tenDanhMuc?.toLowerCase().includes(q) ||
        c.moTa?.toLowerCase().includes(q)
    );
  }, [categories, searchCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchProduct.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.tenSanPham?.toLowerCase().includes(q) ||
        p.moTa?.toLowerCase().includes(q) ||
        p.tenDanhMuc?.toLowerCase().includes(q)
    );
  }, [products, searchProduct]);

  const filteredOrders = useMemo(() => {
    const q = searchOrder.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        String(o.id || "").includes(q) ||
        o.tenKhachHang?.toLowerCase().includes(q) ||
        o.soDienThoai?.toLowerCase().includes(q) ||
        o.trangThai?.toLowerCase().includes(q)
    );
  }, [orders, searchOrder]);

  const formatCurrency = (num) =>
    Number(num || 0).toLocaleString("vi-VN") + "đ";

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "CHO_XU_LY":
        return "bg-yellow-100 text-yellow-700";
      case "DA_LIEN_HE":
        return "bg-blue-100 text-blue-700";
      case "DANG_GIAO":
        return "bg-purple-100 text-purple-700";
      case "HOAN_THANH":
        return "bg-green-100 text-green-700";
      case "HUY":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const openCategoryModal = (item = null) => {
    setSelectedItem(item);
    setCategoryForm({
      tenDanhMuc: item?.tenDanhMuc || "",
      moTa: item?.moTa || "",
      trangThai: item?.trangThai ?? true,
    });
    setModalType("category");
  };

  const openProductModal = (item = null) => {
    setSelectedItem(item);
    setProductForm({
      tenSanPham: item?.tenSanPham || "",
      danhMucId: item?.danhMucId || "",
      gia: item?.gia || "",
      donViTinh: item?.donViTinh || "",
      moTa: item?.moTa || "",
      soLuongTon: item?.soLuongTon ?? "",
      trangThai: item?.trangThai ?? true,
    });
    setModalType("product");
  };

  const openImageModal = () => {
    setSelectedItem(null);
    setImageForm({
      sanPhamId: "",
      file: null,
    });
    setModalType("image");
  };

  const openOrderModal = (item) => {
    setSelectedItem(item);
    setOrderForm({
      trangThai: item?.trangThai || "CHO_XU_LY",
    });
    setModalType("order");
  };

  const openOrderDetailModal = (item) => {
    setSelectedItem(item);
    setModalType("order-detail");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(
          `${API_BASE_URL}/danh-muc/${selectedItem.id}`,
          categoryForm
        );
        showToast("Cập nhật danh mục thành công");
      } else {
        await axios.post(`${API_BASE_URL}/danh-muc`, categoryForm);
        showToast("Thêm danh mục thành công");
      }
      closeModal();
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Lưu danh mục thất bại",
        "error"
      );
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        gia: Number(productForm.gia || 0),
        soLuongTon: Number(productForm.soLuongTon || 0),
        danhMucId: Number(productForm.danhMucId),
      };

      if (selectedItem) {
        await axios.put(
          `${API_BASE_URL}/san-pham/${selectedItem.id}`,
          payload
        );
        showToast("Cập nhật sản phẩm thành công");
      } else {
        await axios.post(`${API_BASE_URL}/san-pham`, payload);
        showToast("Thêm sản phẩm thành công");
      }

      closeModal();
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Lưu sản phẩm thất bại",
        "error"
      );
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    try {
      if (!imageForm.sanPhamId || !imageForm.file) {
        showToast("Vui lòng chọn sản phẩm và ảnh", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", imageForm.file);

      await axios.post(
        `${API_BASE_URL}/hinh-anh/upload/${imageForm.sanPhamId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showToast("Upload ảnh thành công");
      closeModal();
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Upload ảnh thất bại", "error");
    }
  };

  const handleSaveOrderStatus = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/don-hang/${selectedItem.id}/trang-thai`,
        { trangThai: orderForm.trangThai }
      );
      showToast("Cập nhật trạng thái đơn hàng thành công");
      closeModal();
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Cập nhật đơn hàng thất bại", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/danh-muc/${id}`);
      showToast("Xóa danh mục thành công");
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Xóa danh mục thất bại", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/san-pham/${id}`);
      showToast("Xóa sản phẩm thành công");
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Xóa sản phẩm thất bại", "error");
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/don-hang/${id}`);
      showToast("Hủy đơn hàng thành công");
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Hủy đơn hàng thất bại", "error");
    }
  };

  const handleToggleCategory = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/danh-muc/toggle/${id}`);
      showToast("Đổi trạng thái danh mục thành công");
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Đổi trạng thái danh mục thất bại", "error");
    }
  };

  const handleToggleProduct = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/san-pham/toggle/${id}`);
      showToast("Đổi trạng thái sản phẩm thành công");
      fetchAllData();
    } catch (error) {
      console.error(error);
      showToast("Đổi trạng thái sản phẩm thất bại", "error");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">

    {/* Overlay mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <aside
className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-xl transform transition-transform duration-300 overflow-y-auto
${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
  <div>
    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      🏪 Hoàng Thắng
    </h1>
    <p className="text-slate-400 text-sm mt-1">Quản lý cửa hàng</p>
  </div>

  <button
    className="md:hidden text-white text-xl"
    onClick={() => setSidebarOpen(false)}
  >
    ✕
  </button>
</div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarButton
  active={currentTab === "dashboard"}
  icon="📊"
  label="Tổng quan"
  onClick={() => {
    setCurrentTab("dashboard");
    setSidebarOpen(false);
  }}
/>
          <SidebarButton
  active={currentTab === "categories"}
  icon="📁"
  label="Danh mục"
  onClick={() => {
    setCurrentTab("categories");
    setSidebarOpen(false);
  }}
/>

<SidebarButton
  active={currentTab === "products"}
  icon="📦"
  label="Sản phẩm"
  onClick={() => {
    setCurrentTab("products");
    setSidebarOpen(false);
  }}
/>

<SidebarButton
  active={currentTab === "images"}
  icon="🖼️"
  label="Hình ảnh"
  onClick={() => {
    setCurrentTab("images");
    setSidebarOpen(false);
  }}
/>

<SidebarButton
  active={currentTab === "orders"}
  icon="🛒"
  label="Đơn hàng"
  onClick={() => {
    setCurrentTab("orders");
    setSidebarOpen(false);
  }}
/>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="font-medium text-sm">Admin</p>
              <p className="text-slate-400 text-xs">Quản trị viên</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-8">

  {/* Mobile menu button */}
  <button
className="md:hidden fixed top-4 left-4 z-20 bg-slate-800 text-white px-4 py-2 rounded-lg shadow"
onClick={() => setSidebarOpen(true)}
>
☰ Menu
</button>
        {loading && (
          <div className="mb-4 text-sm text-slate-500">Đang tải dữ liệu...</div>
        )}

        {currentTab === "dashboard" && (
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              📊 Tổng quan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon="📁" title="Danh mục" value={categories.length} color="bg-blue-100" />
              <StatCard icon="📦" title="Sản phẩm" value={products.length} color="bg-green-100" />
              <StatCard icon="🖼️" title="Hình ảnh" value={imageCount} color="bg-purple-100" />
              <StatCard icon="🛒" title="Đơn hàng" value={orders.length} color="bg-orange-100" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">
                🎯 Hướng dẫn nhanh
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GuideCard step="1️⃣" title="Tạo danh mục" desc="Bắt đầu bằng việc tạo các danh mục sản phẩm" />
                <GuideCard step="2️⃣" title="Thêm sản phẩm" desc="Thêm sản phẩm vào các danh mục đã tạo" />
                <GuideCard step="3️⃣" title="Upload hình ảnh" desc="Thêm hình ảnh cho từng sản phẩm" />
                <GuideCard step="4️⃣" title="Quản lý đơn hàng" desc="Theo dõi và xử lý các đơn hàng" />
              </div>
            </div>
          </section>
        )}

        {currentTab === "categories" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                📁 Quản lý danh mục
              </h2>
              <button
                onClick={() => openCategoryModal()}
                className="text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <span>➕</span>
                Thêm danh mục
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <input
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="🔍 Tìm kiếm danh mục..."
                  className="w-full md:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Tên danh mục</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Mô tả</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          Không có danh mục
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-500">#{cat.id}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{cat.tenDanhMuc}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{cat.moTa || "-"}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleCategory(cat.id)}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                cat.trangThai
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  cat.trangThai ? "bg-green-500" : "bg-slate-400"
                                }`}
                              />
                              {cat.trangThai ? "Hoạt động" : "Tắt"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openCategoryModal(cat)}
                                className="p-2 hover:bg-blue-50 rounded-lg"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 hover:bg-red-50 rounded-lg"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {currentTab === "products" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                📦 Quản lý sản phẩm
              </h2>
              <button
                onClick={() => openProductModal()}
                className="text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <span>➕</span>
                Thêm sản phẩm
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <input
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="🔍 Tìm kiếm sản phẩm..."
                  className="w-full md:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Tên sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Danh mục</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Giá</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Tồn kho</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                          Không có sản phẩm
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-500">#{prod.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                                {prod.duongDanAnh ? (
                                  <img
                                    src={prod.duongDanAnh}
                                    alt={prod.tenSanPham}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>🖼️</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{prod.tenSanPham}</p>
                                <p className="text-xs text-slate-500">{prod.donViTinh || "-"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                              {prod.tenDanhMuc || "Chưa phân loại"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                            {formatCurrency(prod.gia)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                Number(prod.soLuongTon || 0) > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {prod.soLuongTon || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleProduct(prod.id)}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                prod.trangThai
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  prod.trangThai ? "bg-green-500" : "bg-slate-400"
                                }`}
                              />
                              {prod.trangThai ? "Bán" : "Tắt"}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openProductModal(prod)}
                                className="p-2 hover:bg-blue-50 rounded-lg"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 hover:bg-red-50 rounded-lg"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {currentTab === "images" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                🖼️ Quản lý hình ảnh
              </h2>
              <button
                onClick={openImageModal}
                className="text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <span>➕</span>
                Upload hình ảnh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.filter((p) => p.duongDanAnh).length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400">
                  Chưa có hình ảnh nào
                </div>
              ) : (
                products
                  .filter((p) => p.duongDanAnh)
                  .map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                      <div className="aspect-square bg-slate-100">
                        <img
                          src={p.duongDanAnh}
                          alt={p.tenSanPham}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-slate-800 truncate">
                          {p.tenSanPham}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {p.duongDanAnh}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {currentTab === "orders" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                🛒 Quản lý đơn hàng
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <input
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="🔍 Tìm kiếm đơn hàng..."
                  className="w-full md:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Mã đơn</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">SĐT</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Tổng tiền</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Ngày đặt</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                          Không có đơn hàng
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-sm font-medium text-purple-600">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {order.tenKhachHang}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {order.soDienThoai}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                            {formatCurrency(order.tongTien)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                                order.trangThai
                              )}`}
                            >
                              {order.trangThai}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-slate-500">
                            {formatDate(order.ngayTao)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openOrderDetailModal(order)}
                                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-medium"
                              >
                                👁️ Chi tiết
                              </button>
                              <button
                                onClick={() => openOrderModal(order)}
                                className="p-2 hover:bg-blue-50 rounded-lg"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="p-2 hover:bg-red-50 rounded-lg"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {modalType && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "category" && (
              <form onSubmit={handleSaveCategory}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedItem ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên danh mục
                    </label>
                    <input
                      value={categoryForm.tenDanhMuc}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, tenDanhMuc: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      rows="3"
                      value={categoryForm.moTa}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, moTa: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={categoryForm.trangThai}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, trangThai: e.target.checked })
                      }
                    />
                    <span className="text-sm text-slate-700">Kích hoạt danh mục</span>
                  </label>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-white px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      {selectedItem ? "Cập nhật" : "Thêm mới"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {modalType === "product" && (
              <form onSubmit={handleSaveProduct}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedItem ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên sản phẩm
                    </label>
                    <input
                      value={productForm.tenSanPham}
                      onChange={(e) =>
                        setProductForm({ ...productForm, tenSanPham: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={productForm.danhMucId}
                      onChange={(e) =>
                        setProductForm({ ...productForm, danhMucId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.tenDanhMuc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Giá
                      </label>
                      <input
                        type="number"
                        value={productForm.gia}
                        onChange={(e) =>
                          setProductForm({ ...productForm, gia: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        value={productForm.soLuongTon}
                        onChange={(e) =>
                          setProductForm({ ...productForm, soLuongTon: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Đơn vị tính
                    </label>
                    <input
                      value={productForm.donViTinh}
                      onChange={(e) =>
                        setProductForm({ ...productForm, donViTinh: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      rows="3"
                      value={productForm.moTa}
                      onChange={(e) =>
                        setProductForm({ ...productForm, moTa: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={productForm.trangThai}
                      onChange={(e) =>
                        setProductForm({ ...productForm, trangThai: e.target.checked })
                      }
                    />
                    <span className="text-sm text-slate-700">Cho phép bán</span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-white px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      {selectedItem ? "Cập nhật" : "Thêm mới"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {modalType === "image" && (
              <form onSubmit={handleUploadImage}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    ➕ Upload hình ảnh
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Chọn sản phẩm
                    </label>
                    <select
                      value={imageForm.sanPhamId}
                      onChange={(e) =>
                        setImageForm({ ...imageForm, sanPhamId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.tenSanPham}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Chọn file ảnh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageForm({
                          ...imageForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-white px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            )}

            {modalType === "order" && (
              <form onSubmit={handleSaveOrderStatus}>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    ✏️ Cập nhật đơn hàng
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={orderForm.trangThai}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, trangThai: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none"
                    >
                      {ORDER_STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-white px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      Cập nhật
                    </button>
                  </div>
                </div>
              </form>
            )}

            {modalType === "order-detail" && selectedItem && (
              <div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    📋 Chi tiết đơn hàng
                  </h3>
                  <p className="text-sm text-purple-600 font-mono mt-1">
                    #{selectedItem.id}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      👤 Thông tin khách hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Họ tên:</span>{" "}
                        <span className="font-medium">{selectedItem.tenKhachHang}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">SĐT:</span>{" "}
                        <span className="font-medium">{selectedItem.soDienThoai}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Địa chỉ:</span>{" "}
                        <span className="font-medium">{selectedItem.diaChi}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      📦 Sản phẩm đặt hàng
                    </h4>
                    <div className="space-y-2">
                      {selectedItem.chiTiet?.length > 0 ? (
                        selectedItem.chiTiet.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.tenSanPham}</p>
                              <p className="text-xs text-slate-500">
                                SL: {item.soLuong} × {formatCurrency(item.gia)}
                              </p>
                            </div>
                            <span className="font-medium text-sm">
                              {formatCurrency(item.thanhTien)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          Không có chi tiết đơn hàng
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Tổng tiền:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(selectedItem.tongTien)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Trạng thái:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                        selectedItem.trangThai
                      )}`}
                    >
                      {selectedItem.trangThai}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Ngày đặt:</span>
                    <span className="text-sm font-medium">
                      {formatDate(selectedItem.ngayTao)}
                    </span>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-600 mt-4"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <div
            className={`text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <span>{toast.type === "error" ? "❌" : "✅"}</span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        active
          ? "bg-purple-600/20 text-purple-300"
          : "hover:bg-slate-700/50 text-slate-300"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function GuideCard({ step, title, desc }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <span className="text-2xl">{step}</span>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-slate-500 text-sm">{desc}</p>
      </div>
    </div>
  );
}

export default AdminPage;