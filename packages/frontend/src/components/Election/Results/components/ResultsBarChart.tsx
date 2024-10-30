import { Bar, Cell, ComposedChart, LabelList, Legend, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CHART_COLORS, truncName } from "~/components/util";

export default ({
  data,
  runoff = false,
  colorOffset = 0,
  sortFunc = undefined,
  xKey = "votes",
  percentage = false,
  percentDenominator = undefined,
  star = false,
  majorityLegend = undefined,
  majorityOffset = false,
  height = undefined,
}) => {
  let rawData = data;

  // Truncate names & add percent
  percentDenominator ??= data.reduce((sum, d) => sum + d[xKey], 0);
  percentDenominator = Math.max(1, percentDenominator);
  data = rawData.map((d, i) => {
    let percentValue = Math.round((100 * d[xKey]) / percentDenominator);
    let s = {
      ...d,
      name: (star && i == 0 ? "⭐" : "") + truncName(d["name"], 40),
      // hack to get smaller values to allign different than larger ones
      left: percentage
        ? ((percentValue == 0 && d[xKey] > 0) ? '<1%' : `${Math.round((100 * d[xKey]) / percentDenominator)}%`)
        : Math.round(d[xKey]*100)/100,
      right: "",
    };

    if (d[xKey] / percentDenominator < 0.1 || (majorityLegend && i == 0)) {
      s["right"] = s["left"];
      s["left"] = "";
    }

    return s;
  });

  // Sort entries
  if (sortFunc != false) {
    // we're handling undefined and false difference, so that's why this is explicit
    data.sort(
      sortFunc ??
        ((a, b) => {
          return b[xKey] - a[xKey];
        })
    );
  }

  // compute colors
  let colors = [...CHART_COLORS];
  for (let i = 0; i < colorOffset; i++) {
    colors.push(colors.shift());
  }

  // Add majority
  if (majorityLegend || majorityOffset) {
    let sum = data.reduce((prev, d, i) => {
      if(i == data.length-1) return prev; // don't include exhausted or equal preference votes in the denominator
      return prev + d[xKey];
    }, 0);
    let m = sum / 2;
    data = data.map((d, i) => {
      let s = { ...d };
      s[majorityLegend] = i < 2 ? m : null;
      return s;
    });
    let s = { name: "" };
    s[majorityLegend] = m;
    data.unshift(s);
    colors.unshift(colors.pop());
  }

  // Truncate entries
  const maxCandidates = 10;
  if (rawData.length > maxCandidates) {
    data = data.slice(0, maxCandidates - 1);
    let item = {
      name: `+${rawData.length - (maxCandidates - 1)} more`,
      index: 0,
    };
    item[xKey] = "";
    data.push(item);
  }

  // Size margin to longest candidate
  const longestCandidateName = data.reduce(function (a, b) {
    return a.name.length > b.name.length ? a : b;
  }).name;

  // TODO: try calculating text width: https://www.geeksforgeeks.org/calculate-the-width-of-the-text-in-javascript/
  // 150 is about the max width I'd want for a small mobile device, still looking for a better solution though
  const axisWidth = Math.max(
    50,
    Math.min(
      150, // 150 since that's the width of Equal Preferences
      15 * (longestCandidateName.length > 20 ? 20 : longestCandidateName.length)
    )
  );

  return (
    <ResponsiveContainer width="90%" height={50 * data.length} >
      <ComposedChart data={data} barCategoryGap={5} layout="vertical">
        <XAxis hide axisLine={false} type="number" />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: ".9rem", fill: "black", fontWeight: "bold" }}
          width={axisWidth}
        />
        <Bar
          dataKey={xKey}
          fill="#026A86"
          unit="votes"
          legendType="none"
          style={{overflow: 'visible'}}
        >
          {/* corresponds to mui md size */}
          {/* also this won't dynamically adjust with resizing the screen  */}
          {window.innerWidth > 900 ? <> 
            <LabelList dataKey="left" position="insideRight" fill="black" />
            <LabelList dataKey="right" position="right" fill="black" />
          </>:<>
            <LabelList dataKey="left" position="insideLeft" fill="black" />
            <LabelList dataKey="right" position="insideLeft" fill="black" />
          </>}
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={(runoff && index == data.length-1)? 'var(--brand-gray-1)' : colors[index % colors.length]} />
          ))}
        </Bar>
        <Line
          dataKey={majorityLegend}
          dot={false}
          stroke="black"
          strokeWidth={3}
          strokeDasharray="6 6"
          legendType="plainline"
        />
        {majorityLegend && <Legend />}
      </ComposedChart>
    </ResponsiveContainer>
  );
};