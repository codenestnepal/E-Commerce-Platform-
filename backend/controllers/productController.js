let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  mongoose = { connection: { readyState: 0 }, Types: { ObjectId: { isValid: () => false } } };
}
let Product;
try {
  Product = require("../model/product");
} catch (e) {}

const isDbConnected = () => mongoose && mongoose.connection && mongoose.connection.readyState === 1;

// Default catalog fallback if DB is not connected
const defaultCatalog = [
  {
    _id: "p1",
    id: "p1",
    name: "Smartphone Pro Max",
    category: "Electronics",
    price: 899.99,
    stock: 45,
    description: "Flagship smartphone featuring an ultra-clear 120Hz OLED display, high-capacity 5000mAh battery, and triple-lens 108MP camera array.",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Tech Extreme",
    status: "published",
    isActive: true,
    rating: 4.8,
    reviewsCount: 142
  },
  {
    _id: "p2",
    id: "p2",
    name: "Ultra-Slim 15\" Laptop",
    category: "Electronics",
    price: 1199.00,
    stock: 28,
    description: "High-performance laptop powered by an advanced octa-core processor, 16GB unified RAM, and 512GB ultra-fast NVMe storage in an aerospace aluminum chassis.",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Tech Extreme",
    status: "published",
    isActive: true,
    rating: 4.9,
    reviewsCount: 89
  },
  {
    _id: "p3",
    id: "p3",
    name: "Wireless ANC Headphones",
    category: "Electronics",
    price: 199.50,
    stock: 80,
    description: "Industry-leading active noise canceling headphones with 40-hour continuous battery life, deep bass drivers, and plush memory foam ear cushions.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Tech Extreme",
    status: "published",
    isActive: true,
    rating: 4.7,
    reviewsCount: 310
  },
  {
    _id: "p4",
    id: "p4",
    name: "Fitness Smart Watch",
    category: "Electronics",
    price: 149.99,
    stock: 65,
    description: "Waterproof smartwatch tracking continuous heart rate, SpO2, sleep patterns, and 50+ athletic modes with customizable HD faces.",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Tech Extreme",
    status: "published",
    isActive: true,
    rating: 4.6,
    reviewsCount: 95
  },
  {
    _id: "p5",
    id: "p5",
    name: "Classic Denim Jacket",
    category: "Fashion",
    price: 79.00,
    stock: 50,
    description: "Timeless trucker-style denim jacket crafted from 100% durable organic cotton with vintage stone-wash finish.",
    images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Urban Trends",
    status: "published",
    isActive: true,
    rating: 4.5,
    reviewsCount: 64
  },
  {
    _id: "p6",
    id: "p6",
    name: "Minimalist Cotton T-Shirt",
    category: "Fashion",
    price: 24.99,
    stock: 150,
    description: "Ultra-breathable combed cotton crewneck t-shirt pre-shrunk for an enduring comfortable fit.",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Urban Trends",
    status: "published",
    isActive: true,
    rating: 4.4,
    reviewsCount: 120
  },
  {
    _id: "p7",
    id: "p7",
    name: "Slim Fit Stretch Jeans",
    category: "Fashion",
    price: 59.90,
    stock: 90,
    description: "Contemporary slim-cut denim jeans blended with 2% elastane for maximum comfort and freedom of movement.",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Urban Trends",
    status: "published",
    isActive: true,
    rating: 4.6,
    reviewsCount: 78
  },
  {
    _id: "p8",
    id: "p8",
    name: "Sport Running Sneakers",
    category: "Fashion",
    price: 89.99,
    stock: 60,
    description: "Lightweight cushioned running shoes with high-traction rubber soles and breathable mesh weave.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Urban Trends",
    status: "published",
    isActive: true,
    rating: 4.9,
    reviewsCount: 230
  },
  {
    _id: "p9",
    id: "p9",
    name: "Modern Nordic Sofa",
    category: "Home & Living",
    price: 649.00,
    stock: 12,
    description: "Scandinavian-inspired 3-seater sofa upholstered in spill-resistant textured linen with solid oak tapered legs.",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Nordic Home",
    status: "published",
    isActive: true,
    rating: 4.8,
    reviewsCount: 42
  },
  {
    _id: "p10",
    id: "p10",
    name: "Ergonomic Desk Chair",
    category: "Home & Living",
    price: 229.50,
    stock: 35,
    description: "Adjustable lumbar-support desk chair with breathable mesh backrest, pneumatic height control, and 3D armrests.",
    images: ["https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Nordic Home",
    status: "published",
    isActive: true,
    rating: 4.7,
    reviewsCount: 88
  },
  {
    _id: "p11",
    id: "p11",
    name: "Luxury Skincare Set",
    category: "Beauty",
    price: 68.00,
    stock: 75,
    description: "Four-step daily skincare routine including gentle botanical cleanser, antioxidant toner, hyaluronic serum, and hydrating cream.",
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=85"],
    vendorName: "Glow Naturals",
    status: "published",
    isActive: true,
    rating: 4.9,
    reviewsCount: 156
  },
  {
    _id: "p12",
    id: "p12",
    name: "Non-Slip Yoga Mat & Strap",
    category: "Sports",
    price: 34.99,
    stock: 110,
    description: "Eco-friendly 6mm high-density TPE yoga and fitness mat with dual-textured grip and carrying harness.",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=85"],
    vendorName: "FitLife Equipment",
    status: "published",
    isActive: true,
    rating: 4.7,
    reviewsCount: 92
  }
];

// Seed default products into MongoDB if DB is connected and empty
const seedProductsIfEmpty = async () => {
  if (!isDbConnected() || !Product) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(defaultCatalog.map(p => ({
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        description: p.description,
        images: p.images,
        vendorName: p.vendorName,
        status: "published",
        isActive: true
      })));
      console.log("[Product Seeder] Successfully seeded initial store catalog into MongoDB");
    }
  } catch (err) {
    console.warn("[Product Seeder Warning]", err.message);
  }
};

// -------------------------------------------------------------
// GET ALL PRODUCTS (WITH FILTERS, SEARCH, SORT, PAGINATION)
// -------------------------------------------------------------
const getProducts = async (req, res) => {
  try {
    await seedProductsIfEmpty();

    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 40
    } = req.query;

    if (isDbConnected() && Product) {
      const query = { isActive: true, status: "published" };

      if (category && category.toLowerCase() !== "all") {
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      let sortOption = { createdAt: -1 };
      if (sort === "price-low") sortOption = { price: 1 };
      else if (sort === "price-high") sortOption = { price: -1 };
      else if (sort === "name") sortOption = { name: 1 };

      const skip = (Number(page) - 1) * Number(limit);
      const [products, total] = await Promise.all([
        Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)).lean(),
        Product.countDocuments(query)
      ]);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        products
      });
    }

    // Fallback in-memory catalog
    let list = defaultCatalog.slice();

    if (category && category.toLowerCase() !== "all") {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({
      success: true,
      count: list.length,
      total: list.length,
      page: 1,
      pages: 1,
      products: list
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
};

// -------------------------------------------------------------
// GET SINGLE PRODUCT BY ID OR NAME
// -------------------------------------------------------------
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && Product) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id).lean();
      }
      if (!product) {
        product = await Product.findOne({
          $or: [{ name: { $regex: new RegExp(`^${id}$`, "i") } }, { _id: id }]
        }).lean();
      }

      if (product) {
        return res.status(200).json({ success: true, product });
      }
    }

    // In-memory fallback
    const found = defaultCatalog.find(p =>
      p._id === id ||
      p.id === id ||
      p.name.toLowerCase() === id.toLowerCase() ||
      encodeURIComponent(p.name).toLowerCase() === id.toLowerCase()
    );

    if (!found) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({ success: true, product: found });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// GET FEATURED PRODUCTS
// -------------------------------------------------------------
const getFeaturedProducts = async (req, res) => {
  try {
    if (isDbConnected() && Product) {
      const products = await Product.find({ isActive: true, status: "published" }).limit(8).lean();
      return res.status(200).json({ success: true, products });
    }
    return res.status(200).json({ success: true, products: defaultCatalog.slice(0, 8) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts
};
