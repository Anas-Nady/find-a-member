import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/userModel";

const ADMIN_IP = "102.187.214.101";

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

export async function GET(request: Request) {
  await connectDB();

  try {
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectDB();

  try {
    const body = await request.json();
    const { headers } = request;
    const forwardedFor = headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    const newUser = new User({
      ...body,
      ipAddress: clientIp,
    });

    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connectDB();

  try {
    const body = await request.json();
    const { headers } = request;
    const forwardedFor = headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    const user = await User.findOne({ _id: body.id, ipAddress: clientIp });

    if (user) {
      user.set({ ...body, ipAddress: clientIp });
      await user.save();
      return NextResponse.json(user, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Entry not found or unauthorized" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { headers } = request;
    const forwardedFor = headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    const user = await User.findById(id);

    if (user && (clientIp === ADMIN_IP || user.ipAddress === clientIp)) {
      await User.findByIdAndDelete(id);
      return NextResponse.json(user, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Entry not found or unauthorized" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
