import { NextResponse } from "next/server";
import { NextApiRequest } from "next";

interface Entry {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  ipAddress: string;
}

let entries: Entry[] = [
  {
    id: 1,
    name: "John Doe",
    phone: "123-456-7890",
    specialization: "Web Development",
    ipAddress: "127.0.0.1",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "987-654-3210",
    specialization: "Mobile Development",
    ipAddress: "192.168.0.1",
  },
];

const ADMIN_IP = "102.187.214.101";

export async function GET(request: Request) {
  const { headers } = request;
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { headers } = request;
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  const newEntry: Entry = {
    id: entries.length + 1,
    ...body,
    ipAddress: clientIp,
  };
  entries.push(newEntry);
  return NextResponse.json(newEntry, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { headers } = request;
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  const index = entries.findIndex(
    (entry) => entry.id === body.id && entry.ipAddress === clientIp
  );

  if (index !== -1) {
    entries[index] = { ...entries[index], ...body, ipAddress: clientIp };
    return NextResponse.json(entries[index], { status: 200 });
  } else {
    return NextResponse.json(
      { error: "Entry not found or unauthorized" },
      { status: 404 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { headers } = request;
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  const index = entries.findIndex((entry) => entry.id === Number(id));

  if (
    index !== -1 &&
    (clientIp === ADMIN_IP || entries[index].ipAddress === clientIp)
  ) {
    const deletedEntry = entries.splice(index, 1)[0];
    return NextResponse.json(deletedEntry, { status: 200 });
  } else {
    return NextResponse.json(
      { error: "Entry not found or unauthorized" },
      { status: 404 }
    );
  }
}
