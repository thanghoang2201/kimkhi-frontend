export default function Cart({cart}){

const total = cart.reduce(
 (sum,item)=>sum + item.gia,
 0
);

return(

<div className="bg-white shadow p-4 rounded">

<h2 className="font-bold mb-2">

Giỏ hàng

</h2>

{cart.map((p,index)=>(

<div key={index} className="flex justify-between">

<span>{p.tenSanPham}</span>

<span>{p.gia}</span>

</div>

))}

<hr className="my-2"/>

<p className="font-bold">

Tổng: {total} VND

</p>

</div>

)

}