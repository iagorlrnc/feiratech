export function getSubdomain(): "admin" | "ceo" | "public" {
  const host = window.location.hostname

  // Check for subdomain (works in both production and localhost)
  if (host.includes(".")) {
    const parts = host.split(".")
    if (parts.length >= 2) {
      const subdomain = parts[0].toLowerCase()
      if (subdomain === "admin") return "admin"
      if (subdomain === "ceo") return "ceo"
    }
  }

  // Dev fallback via path prefix
  const path = window.location.pathname
  if (path.startsWith("/admin")) return "admin"
  if (path.startsWith("/ceo")) return "ceo"

  return "public"
}

export function getSubdomainUrl(
  targetSubdomain: "admin" | "ceo" | "public",
  path: string = "/",
): string {
  const host = window.location.hostname
  const port = window.location.port
  const protocol = window.location.protocol
  const portString = port ? `:${port}` : ""

  // Check if currently using subdomain-based routing (admin.localhost, ceo.localhost, or production subdomains)
  const currentSubdomain = getSubdomain()
  const isSubdomainBased =
    host.includes(".") && (host.startsWith("admin.") || host.startsWith("ceo."))

  // If using subdomain-based routing (localhost with subdomains or production)
  if (isSubdomainBased) {
    if (targetSubdomain === "public") {
      // Remove subdomain and return to root domain
      const parts = host.split(".")
      const rootDomain = parts.slice(1).join(".")
      return `${protocol}//${rootDomain}${portString}${path}`
    }

    // Replace or add subdomain
    const parts = host.split(".")
    const rootDomain = parts.slice(1).join(".")
    return `${protocol}//${targetSubdomain}.${rootDomain}${portString}${path}`
  }

  // If using path-based routing (localhost without subdomains)
  return path
}
