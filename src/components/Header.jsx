import { useState } from "react";

export default function Header({cartCount}){

 const [keyword,setKeyword] = useState("");

 return(

<header className="bg-blue-600 text-white p-4">

<div className="container mx-auto flex justify-between items-center">

<h1 className="text-xl font-bold">
Kim Khí Quang Hương
</h1>

<input
 type="text"
 placeholder="Tìm sản phẩm..."
 className="px-3 py-1 rounded text-black"
 value={keyword}
 onChange={(e)=>setKeyword(e.target.value)}
/>

<div>

🛒 Giỏ hàng ({cartCount})

</div>

</div>

</header>

 )

}