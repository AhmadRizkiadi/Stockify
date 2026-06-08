import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sku:{
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    minimumStock: {
        type: Number,
        default: 5,
    },
    unit:{
        type: String,
        default: "pcs",
    },
    price: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: "",
    },
    imageUrl:{
        type: String,
        default: "",
    },
    imagePublicId:{
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;