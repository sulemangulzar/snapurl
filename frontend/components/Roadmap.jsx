function Roadmap() {
  const roadmapItems = [
    {
      status: "Built",
      title: "Core short links",
      text: "Create short URLs, save them to your account, and redirect visitors to the original destination.",
    },
    {
      status: "Built",
      title: "Basic click tracking",
      text: "Each redirect updates the click count and stores simple analytics data for future dashboard insights.",
    },
    {
      status: "Next",
      title: "QR code downloads",
      text: "Generate a QR code for every short link so users can share links on posters, cards, and offline material.",
    },
    {
      status: "Next",
      title: "Better analytics",
      text: "Add cleaner charts for clicks over time, devices, browsers, and top-performing links.",
    },
    {
      status: "Later",
      title: "Custom aliases",
      text: "Let users create branded links like snapurl.ink/product-launch instead of random short codes.",
    },
    {
      status: "Later",
      title: "API access",
      text: "Allow developers to create and manage short links from their own tools and apps.",
    },
  ];

  return (
    <section id="roadmap" className="bg-white px-4 pb-16 text-black sm:px-6 sm:pb-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">
              Roadmap
            </p>

            <h2 className="max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Building the useful parts first.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
              SnapURL is being built as a focused MVP. The first goal is to make link shortening reliable, then add the features users ask for most.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roadmapItems.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] bg-gray-100 p-6">
                <span
                  className={`mb-5 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    item.status === "Built"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Next"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>

                <h3 className="text-xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Roadmap;
