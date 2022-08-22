import React from "react";
import { StyleSheet } from "react-native";
import {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text,
} from "react-native-svg";
import { AreaChart } from "react-native-svg-charts";

const Shadow = ({ line }:any) => (
  <Path
    key={"shadow"}
    y={5}
    d={line}
    fill={"none"}
    strokeWidth={2}
    stroke={"#E2E6FB"}
  />
);

const Decorator = ({ x, y, data }:any) => {
  return data.map((value:any, index:any) => {
    if (index === 0) return null;
    if (data.length - 1 === index)
      return (
        <G key={index}>
          <Text
            x={x(index)-10}
            y={y(value)}
            fontSize="26"
            fontWeight="bold"
            fill={"#4461D4"}
            textAnchor="middle"
          >
            {data[index]}
          </Text>
          <G fill="none" fillRule="evenodd">
            <Circle
              strokeOpacity={0.199}
              stroke="#4D7BF3"
              fillOpacity={0.079}
              fill="#4D7BF3"
              cx={x(index)}
              cy={y(value)}
              r={12.5}
            />
            <Circle fill="#4D7BF3" cx={x(index)} cy={y(value)} r={5} />
            <Circle fill="#FFF" cx={x(index)} cy={y(value)} r={2} />
          </G>
        </G>
      );
    return (
      <G key={index}>
        <Circle
          key={index}
          cx={x(index)}
          cy={y(value)}
          r={4}
          fill={"#4D7BF3"}
        />
        <Text
          x={x(index) - 10}
          y={y(value) - 10}
          fontSize="16"
          fill={"#4461D4"}
          textAnchor="middle"
        >
          {data[index]}
        </Text>
      </G>
    );
  });
};

const Line = ({ line }:any) => (
  <Path d={line} stroke={"#4D7BF3"} fill={"none"} strokeWidth={2} />
);

const Gradient = ({ index }:any) => (
  <Defs key={index}>
    <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"100%"} y2={"0%"}>
      <Stop offset={"0%"} stopColor={"#FAFBFC"} />
      <Stop offset={"100%"} stopColor={"#EDF1FC"} />
    </LinearGradient>
  </Defs>
);

export default ({ containerStyle, data }:any) => (
  <AreaChart
    style={containerStyle}
    data={data}
    svg={{ fill: "url(#gradient)" }}
    contentInset={{ top: 50, bottom: 14, right: 16, left: 16 }}
  >
    <Shadow />
    <Line />
    <Gradient />
    <Decorator />
  </AreaChart>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});