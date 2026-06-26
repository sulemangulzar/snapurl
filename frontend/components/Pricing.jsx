function Pricing({ onNavigate }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For students, builders, and anyone testing the product.",
      features: [
        "10 short links",
        "Basic click count",
        "SnapURL branded links",
        "Simple dashboard access",
      ],
      button: "Start Free",
      highlighted: false,
    },
    {
      name: "Maker",
      price: "$5",
      description: "For freelancers and indie makers sharing links regularly.",
      features: [
        "100 short links",
        "QR code downloads",
        "Basic analytics history",
        "Custom aliases",
      ],
      button: "Choose Maker",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "$12",
      description: "For creators and small teams who need more room to grow.",
      features: [
        "Unlimited short links",
        "QR codes for every link",
        "Advanced analytics export",
        "Priority feature requests",
      ],
      button: "Choose Pro",
      highlighted: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="bg-white px-4 pb-16 text-black sm:px-6 sm:pb-24 lg:px-10"
    >
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-black px-4 py-12 text-white sm:rounded-[3rem] sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            Pricing
          </p>

          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Fair pricing for an early product.
          </h2>

          <p className="mt-5 text-sm leading-6 text-white/60 sm:text-base">
            SnapURL starts affordable because the MVP is focused. Pay for useful
            link management, not unnecessary enterprise bloat.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[1.75rem] p-6 transition sm:p-7 ${
                plan.highlighted
                  ? "bg-white text-black shadow-2xl shadow-violet-500/20"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-5 inline-flex rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Best for launch
                </span>
              )}

              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                {plan.name}
              </h3>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-[-0.06em]">
                  {plan.price}
                </span>
                <span
                  className={`mb-2 text-sm ${
                    plan.highlighted ? "text-gray-500" : "text-white/50"
                  }`}
                >
                  /mo
                </span>
              </div>

              <p
                className={`mt-4 text-sm leading-6 ${
                  plan.highlighted ? "text-gray-600" : "text-white/60"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                        plan.highlighted
                          ? "bg-violet-600 text-white"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate("signup")}
                className={`mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "bg-white text-black hover:bg-violet-600 hover:text-white"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-white/40">
          Note: QR codes, custom aliases, and exports are planned as part of the
          MVP roadmap. Early users help shape what gets built first.
        </p>
      </div>
    </section>
  );
}

export default Pricing;
