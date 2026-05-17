import { Product } from "../../models/product.model";
import { CreateProductInput, UpdateProductInput } from "./product.interface";

const createProduct = async (input: CreateProductInput) => {
    const product = await Product.create(input);
    return product;
};

const getAllProducts = async () => {
    return await Product.find().populate("categoryId").sort({ createdAt: -1 });
};

const getSingleProduct = async (id: string) => {
    const product = await Product.findById(id).populate("categoryId");
    if (!product) throw new Error("Product not found");
    return product;
};

const updateProduct = async (id: string, input: UpdateProductInput) => {
    const product = await Product.findByIdAndUpdate(id, input, {
        new: true,
    }).populate("categoryId");

    if (!product) throw new Error("Product not found");
    return product;
};

const deleteProduct = async (id: string) => {
    const product = await Product.findByIdAndDelete(id);

    if (!product) throw new Error("Product not found");

    return { message: "Product deleted successfully" };
};

const getProductsByCategory = async (categoryId: string) => {
    return await Product.find({ categoryId }).populate("categoryId");
};

export const ProductService = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
};
