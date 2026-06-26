function Features() {
  const features = [
    {
      title: "Create short links",
      text: "Turn long URLs into clean SnapURL links that are easier to share in bios, messages, emails, and client work.",
      icon: "🔗",
    },
    {
      title: "Redirect visitors",
      text: "When someone opens your short link, SnapURL sends them to the original destination and records the visit.",
      icon: "🚀",
    },
    {
      title: "Track clicks",
      text: "Every link stores a click count, so you can quickly see which links are getting attention.",
      icon: "📊",
    },
    {
      title: "Basic analytics",
      text: "Save useful click data like time, user agent, and IP address so analytics can improve over time.",
      icon: "🧠",
    },
    {
      title: "Private dashboard",
      text: "Users can sign up, log in, and manage only their own links with protected JWT authentication.",
      icon: "🔐",
    },
    {
      title: "QR codes next",
      text: "The next feature is QR code generation so every short link can also be shared offline or on print material.",
      icon: "▣",
    },
  ];

  return (
    <section
      id="features"
      className="bg-white px-4 py-16 text-black sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">
            Features
          </p>

          <h2 className="text-4xl font-semibold leading-[1.05] tracking-lighter sm:text-5xl lg:text-6xl">
            Focused features for the first real version.
          </h2>

          <p className="mt-5 text-sm leading-6 text-gray-600 sm:text-base">
            SnapURL is not trying to be a bloated enterprise tool. The MVP is
            built around the features users need first: create, share, redirect,
            and track links.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[1.75rem] bg-gray-100 p-6 transition hover:bg-gray-200"
            >
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-lg text-white">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold tracking-[-0.03em]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
