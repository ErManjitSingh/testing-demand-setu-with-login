import fs from "fs";
import path from "path";

const ROOT = path.resolve(
  "src/components/partner/hotel-manager"
);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (/\.(jsx|js)$/.test(entry.name)) return [full];
    return [];
  });
}

function adapt(content, filePath) {
  let out = content;

  if (!out.startsWith('"use client"') && !out.startsWith("'use client'")) {
    out = `"use client";\n\n${out}`;
  }

  out = out.replace(
    /import\s+\{\s*Link\s*\}\s+from\s+["']react-router-dom["'];?\n?/g,
    'import Link from "next/link";\n'
  );
  out = out.replace(
    /import\s+\{\s*Link,\s*([^}]+)\}\s+from\s+["']react-router-dom["'];?/g,
    'import Link from "next/link";\nimport { $1 } from "next/navigation";\n'
  );
  out = out.replace(
    /import\s+\{\s*([^}]*)\s*,\s*Link\s*,\s*([^}]*)\}\s+from\s+["']react-router-dom["'];?/g,
    'import Link from "next/link";\nimport { $1, $2 } from "next/navigation";\n'
  );
  out = out.replace(
    /import\s+\{\s*useLocation,\s*useNavigate\s*\}\s+from\s+["']react-router-dom["'];?/g,
    'import { useParams, useRouter } from "next/navigation";\n'
  );
  out = out.replace(
    /import\s+\{\s*useNavigate\s*\}\s+from\s+["']react-router-dom["'];?/g,
    'import { useRouter } from "next/navigation";\n'
  );
  out = out.replace(
    /import\s+\{\s*useLocation,\s*Link,\s*useNavigate\s*\}\s+from\s+["']react-router-dom["'];?/g,
    'import Link from "next/link";\nimport { useParams, useRouter } from "next/navigation";\n'
  );

  out = out.replace(/const navigate = useNavigate\(\);?/g, "const router = useRouter();");
  out = out.replace(/\bnavigate\(/g, "router.push(");
  out = out.replace(/<Link to=/g, "<Link href=");

  out = out.replace(
    /import config from ["'][\.\/]+config["'];?\n?/g,
    'import { API_BASE_URL } from "@/lib/apiConfig";\n'
  );
  out = out.replace(/\$\{config\.API_HOST\}/g, "${API_BASE_URL}");
  out = out.replace(/config\.API_HOST/g, "API_BASE_URL");

  out = out.replace(
    /const config = \{\s*API_HOST:[^}]+\};?\n?/g,
    ""
  );

  out = out.replace(
    /from\s+["'][\.\/]+firebase["']/g,
    'from "@/lib/firebasePartner"'
  );
  out = out.replace(
    /from\s+["'][\.\/]+common\/functions["']/g,
    'from "@/lib/partner/hotelManagerUtils"'
  );
  out = out.replace(
    /from\s+["'][\.\/]+ui-kit\/atoms\/Modal["']/g,
    'from "@/components/partner/hotel-manager/Modal"'
  );
  out = out.replace(
    /from\s+["'][\.\/]+context\/HotelManagerContext["']/g,
    'from "@/context/HotelManagerContext"'
  );
  out = out.replace(
    /from\s+["'][\.\/]+HotelManagerContext["']/g,
    'from "@/context/HotelManagerContext"'
  );

  // Next.js partner routes
  out = out.replace(/href="\/property"/g, 'href="/partner/hotels/new"');
  out = out.replace(/href='\/property'/g, "href='/partner/hotels/new'");
  out = out.replace(/to={`\/onboarding\//g, "href={`/partner/hotels/onboarding/");
  out = out.replace(/href={`\/onboarding\//g, "href={`/partner/hotels/onboarding/");
  out = out.replace(
    /href={`\/update\/\$\{slugify\([^}]+\)\}\/\$\{([^}]+)\}`}/g,
    "href={`/partner/hotels/update/${$1}`}"
  );
  out = out.replace(
    /href={`\/property\/\$\{slugify\([^}]+\)\}\/\$\{([^}]+)\}`}/g,
    "href={`/partner/hotels/${$1}/inventory`}"
  );
  out = out.replace(/href="\/hotel-manager"/g, 'href="/partner/hotels"');
  out = out.replace(/href="\/"/g, 'href="/partner/hotels"');

  if (filePath.includes("StepperForm")) {
    out = out.replace(
      /useEffect\(\(\) => \{\s*\/\/ Extract the ID from the URL\s*const pathParts = location\.pathname\.split\("\/"\);\s*const id = pathParts\[pathParts\.length - 1\];\s*setPropertyIdFromUrl\(id\);\s*\}, \[location\.pathname\]\);/s,
      `const params = useParams();
  useEffect(() => {
    const id = params?.hotelId || params?.hotelType || "";
    if (id && id !== "hotel" && id !== "BnBs" && id !== "homeStays&Villas") {
      setPropertyIdFromUrl(id);
    }
  }, [params?.hotelId, params?.hotelType]);`
    );
    if (!out.includes("useParams")) {
      out = out.replace(
        'import { useRouter } from "next/navigation";',
        'import { useParams, useRouter } from "next/navigation";'
      );
    }
  }

  if (filePath.includes("InventoryUpdate") || filePath.includes("BulkUpdate")) {
    out = out.replace(
      /const location = useLocation\(\);\s*const \[propertyId, setPropertyId\] = useState\(""\);\s*useEffect\(\(\) => \{\s*const pathParts = location\.pathname\.split\("\/"\);\s*const id = pathParts\[pathParts\.length - 1\];\s*setPropertyId\(id\);\s*\}, \[location\.pathname\]\);/s,
      `const params = useParams();
  const propertyId = params?.hotelId || "";`
    );
    if (!out.includes("useParams") && out.includes("useRouter")) {
      out = out.replace(
        'import { useRouter } from "next/navigation";',
        'import { useParams, useRouter } from "next/navigation";'
      );
    }
  }

  return out;
}

for (const file of walk(ROOT)) {
  const raw = fs.readFileSync(file, "utf8");
  const next = adapt(raw, file);
  fs.writeFileSync(file, next);
  console.log("adapted", path.relative(process.cwd(), file));
}
