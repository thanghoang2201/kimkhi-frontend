export default function ProductCard({product,addToCart}){

return(

<div className="bg-white shadow rounded p-3">

<img
 src={product.duongDanAnh}
 className="h-40 w-full object-cover"
/>

<h3 className="font-semibold mt-2">

{product.tenSanPham}

</h3>

<p className="text-orange-600 font-bold">

{product.gia} VND

</p>

<button
 className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
 onClick={()=>addToCart(product)}
>

Thêm vào giỏ

</button>

</div>

)

}