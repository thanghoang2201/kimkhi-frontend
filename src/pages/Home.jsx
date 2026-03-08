import { useEffect, useMemo, useState } from "react";
import { getAllCategories, getAllProducts, createOrder } from "../api/productApi";

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Thay số này bằng số Zalo thật của bạn
  const zaloPhone = "0775274542";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryData, productData] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
        ]);

        setCategories(categoryData.filter((item) => item.trangThai !== false));
        setProducts(productData.filter((item) => item.trangThai !== false));
      } catch (error) {
        console.error("Lỗi load dữ liệu:", error);
        alert("Không tải được dữ liệu backend");
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentCategory) {
      result = result.filter((p) => p.danhMucId === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.tenSanPham?.toLowerCase().includes(q) ||
          p.moTa?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, currentCategory, searchQuery]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);

      if (existingIndex !== -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      return [...prev, { ...product, quantity }];
    });

    setSelectedProduct(null);
  };

  const updateCartItem = (index, delta) => {
    setCart((prev) => {
      const newCart = [...prev];
      newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
      return newCart;
    });
  };

  const removeCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totalMoney = cart.reduce(
    (sum, item) => sum + Number(item.gia) * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    try {
      if (!customerPhone.trim() || !customerAddress.trim()) {
        alert("Vui lòng nhập số điện thoại và địa chỉ");
        return;
      }

      const payload = {
        tenKhachHang: customerName,
        soDienThoai: customerPhone,
        diaChi: customerAddress,
        chiTiet: cart.map((item) => ({
          sanPhamId: item.id,
          soLuong: item.quantity,
        })),
      };

      // 1. Tạo đơn hàng ở backend
      await createOrder(payload);

      // 2. Tạo nội dung đơn hàng để copy
      let orderText = `📦 ĐƠN HÀNG MỚI\n`;
      orderText += `============================\n`;
      orderText += `👤 Khách hàng: ${customerName || "Không có"}\n`;
      orderText += `📞 Số điện thoại: ${customerPhone}\n`;
      orderText += `📍 Địa chỉ: ${customerAddress}\n`;
      orderText += `📝 Ghi chú: ${customerNote || "Không có"}\n`;
      orderText += `----------------------------\n`;

      cart.forEach((item, index) => {
        orderText += `${index + 1}. ${item.tenSanPham}\n`;
        orderText += `   - Số lượng: ${item.quantity}\n`;
        orderText += `   - Đơn giá: ${formatPrice(item.gia)}\n`;
        orderText += `   - Thành tiền: ${formatPrice(Number(item.gia) * item.quantity)}\n`;
      });

      orderText += `----------------------------\n`;
      orderText += `💰 Tổng tiền: ${formatPrice(totalMoney)}\n`;

      // 3. Copy vào clipboard
      await navigator.clipboard.writeText(orderText);

      // 4. Đóng checkout, mở modal thành công
      setShowCheckout(false);
      setShowSuccessModal(true);

      // 5. Reset form + giỏ hàng
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerNote("");
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại hoặc không copy được đơn hàng");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setCurrentCategory(null);
                setSearchQuery("");
              }}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-orange-600 text-2xl">🔩</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">KIM KHÍ QUANG HƯƠNG</h1>
                <p className="text-xs text-orange-100">Vật liệu xây dựng chất lượng</p>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 pl-12 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-inner"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCart(true)}
              className="relative bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all"
            >
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center pulse-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="md:hidden mt-3">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full text-gray-800 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="banner-slide absolute inset-0 flex items-center justify-center bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">🔧 KHUYẾN MÃI LỚN 🔧</h2>
            <p className="text-lg md:text-xl">Giảm đến 30% tất cả sản phẩm kim khí</p>
          </div>
        </div>

        <div className="banner-slide absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">🏗️ CHẤT LƯỢNG CAO 🏗️</h2>
            <p className="text-lg md:text-xl">Sản phẩm chính hãng - Giá tốt</p>
          </div>
        </div>

        <div className="banner-slide absolute inset-0 flex items-center justify-center bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">🚚 GIAO HÀNG NHANH 🚚</h2>
            <p className="text-lg md:text-xl">Hỗ trợ đặt hàng trực tuyến</p>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
            Danh Mục Sản Phẩm
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className="category-btn bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-md flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📦</span>
                <span className="font-semibold text-sm text-center">
                  {cat.tenDanhMuc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
              {currentCategory
                ? categories.find((c) => c.id === currentCategory)?.tenDanhMuc
                : "Tất Cả Sản Phẩm"}
            </h2>

            {currentCategory && (
              <button
                onClick={() => setCurrentCategory(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all"
              >
                ← Quay lại
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              Không tìm thấy sản phẩm phù hợp
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="product-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {product.duongDanAnh ? (
                      <img
                        src={product.duongDanAnh}
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl">🛠️</div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                      {product.tenSanPham}
                    </h3>
                    <p className="text-orange-600 font-bold">
                      {formatPrice(product.gia)}
                    </p>
                    <p className="text-xs text-gray-500">/{product.donViTinh}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          formatPrice={formatPrice}
          products={products}
        />
      )}

      {/* Cart modal */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div
            className="modal-overlay absolute inset-0"
            onClick={() => setShowCart(false)}
          ></div>

          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-in flex flex-col">
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">🛒 Giỏ Hàng</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Giỏ hàng trống</div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 bg-white rounded-xl p-3 mb-3 shadow-sm"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.duongDanAnh ? (
                        <img
                          src={item.duongDanAnh}
                          alt={item.tenSanPham}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>🛠️</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                        {item.tenSanPham}
                      </h4>
                      <p className="text-orange-600 font-bold text-sm">
                        {formatPrice(item.gia)}/{item.donViTinh}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartItem(index, -1)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(index, 1)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeCartItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        🗑️
                      </button>
                      <span className="font-bold text-gray-800">
                        {formatPrice(Number(item.gia) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tổng tiền (ước tính):</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatPrice(totalMoney)}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đặt Hàng Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50">
          <div
            className="modal-overlay absolute inset-0"
            onClick={() => setShowCheckout(false)}
          ></div>

          <div className="absolute inset-4 md:inset-y-10 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in flex flex-col">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">📋 Thông Tin Đặt Hàng</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-2">📦 Đơn hàng của bạn</h3>

                <div className="text-sm text-gray-600 space-y-1 max-h-32 overflow-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.tenSanPham} x{item.quantity}
                      </span>
                      <span>{formatPrice(Number(item.gia) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between">
                  <span className="font-bold">Tổng tiền:</span>
                  <span className="font-bold text-orange-600">
                    {formatPrice(totalMoney)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="2"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    rows="2"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Ghi chú thêm (nếu có)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t bg-gray-50 p-4">
              <button
                onClick={handleCreateOrder}
                disabled={!customerPhone.trim() || !customerAddress.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Xác Nhận Đặt Hàng
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                * Vui lòng nhập số điện thoại và địa chỉ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="modal-overlay absolute inset-0"
            onClick={() => setShowSuccessModal(false)}
          ></div>

          <div className="absolute inset-4 md:inset-y-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in flex flex-col">
            <div className="flex-1 p-8 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">✅</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Đặt hàng thành công
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Đơn hàng đã được copy, vui lòng ấn vào Zalo ở dưới để gửi đơn hàng tới cửa hàng.
              </p>

              <a
                href={`https://zalo.me/${zaloPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl">💬</span>
                Gửi qua Zalo
              </a>
            </div>

            <div className="border-t bg-gray-50 p-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nút Zalo nổi */}
      <a
        href={`https://zalo.me/${zaloPhone}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all"
      >
        <span className="text-xl">💬</span>
        <span className="font-semibold hidden sm:inline">Liên hệ Zalo</span>
      </a>
    </div>
  );
}

function ProductDetailModal({ product, onClose, onAddToCart, formatPrice, products }) {
  const [quantity, setQuantity] = useState(1);

  const relatedProducts = products
    .filter((p) => p.danhMucId === product.danhMucId && p.id !== product.id)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-overlay absolute inset-0" onClick={onClose}></div>

      <div className="absolute inset-4 md:inset-10 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  {product.duongDanAnh ? (
                    <img
                      src={product.duongDanAnh}
                      alt={product.tenSanPham}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-8xl">🛠️</div>
                  )}
                </div>
              </div>

              <div className="md:w-1/2">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full mb-3">
                  {product.tenDanhMuc}
                </span>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {product.tenSanPham}
                </h2>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-orange-600">
                    {formatPrice(product.gia)}
                  </span>
                  <span className="text-gray-500">/ {product.donViTinh}</span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{product.moTa}</p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 font-medium">Số lượng:</span>

                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-all"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-16 text-center py-2 font-semibold text-lg focus:outline-none"
                    />

                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Thêm Vào Giỏ
                </button>
              </div>
            </div>
          </div>

          <div className="border-t bg-gray-50 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm khác</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="product-card bg-white rounded-xl shadow overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {p.duongDanAnh ? (
                      <img
                        src={p.duongDanAnh}
                        alt={p.tenSanPham}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">🛠️</div>
                    )}
                  </div>

                  <div className="p-2">
                    <h4 className="font-medium text-gray-800 text-xs line-clamp-2">
                      {p.tenSanPham}
                    </h4>
                    <p className="text-orange-600 font-bold text-sm">
                      {formatPrice(p.gia)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;