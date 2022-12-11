import React from "react";

export class ActionBlock extends React.Component {
  constructor(props) {
    super(props);
  }

  makeBadges() {
    let badgeElements = [];
    if (
      this.props.details[2] &&
      this.props.details[2].includes("trigger event")
    ) {
      let triggerEvent = this.props.details[2].match(/event .+$/g)[0].slice(5);
      badgeElements.push(
        <div class="badge badge-info">{triggerEvent} Trigger</div>
      );
    }

    if (this.props.action.includes("MANAGED_PKG")) {
      badgeElements.push(
        <div class="badge badge-secondary">Managed Package</div>
      );
    }

    return badgeElements;
  }

  makeIndents() {
    let indents = [];
    console.log(this.props.indentLevel);

    for (let i = 0; i < this.props.indentLevel; i++) {
      indents.push(<div className="float-left divider w-20"></div>);
      indents.push(<div className="float-left divider w-20"></div>);
    }

    return indents;
  }

  render() {
    return (
      <>
        <div>
          {this.makeIndents()}
          <div
            className="card card-side shadow-xl card-bordered
                      card-compact bg-base-200 text-content
                      border-1 border-info-content w-2/3 m-10"
          >
            <figure className="place-self-center">
              <p className="inline-block align-middle m-5 font-semibold">
                {this.props.time}
              </p>
              <div className="badge grow">{this.props.duration}ms</div>
            </figure>
            <div className="divider divider-horizontal"></div>
            <div className="card-body text-info-content">
              <div>
                <h5 className="card-title">{this.props.action}</h5>
                <h6>{this.props.details.join(" | ")}</h6>
                <div className="divider w-full"></div>
                <div>{this.makeBadges()}</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export function LimitBlock(props) {
  return (
    <div className="card shadow-xl card-bordered card-compact bg-warning text-warning-content border-1 border-warning-content w-3/4 m-10">
      <div className="card-body prose">
        <h5 className="card-title">
          {props.action}: {props.details}
        </h5>
        <div className="divider"></div>
        <div className="flex">
          <p className="flex-grow">{props.time}</p>
          <div className="divider divider-horizontal"></div>
          <p className="flex-grow">{props.details}</p>
        </div>
      </div>
    </div>
  );
}

export class OutputSection extends React.Component {
  doLinesMatch(line1, line2) {
    let indexAfterTime1 = line1.indexOf("|");
    let indexAfterTime2 = line2.indexOf("|");

    let remainder1 = line1.slice(indexAfterTime1);
    let remainder2 = line2.slice(indexAfterTime2);

    return remainder1 == remainder2;
  }

  getLimitBlock(limits) {
    return;
  }

  convertInputToBlocks(input) {
    let actionBlocks = [];

    if (input) {
      input = input.trim();
      let inputLines = input.split("\n");
      let debugSettings = inputLines[0];
      let userInfo = inputLines[1];

      let remainingLines = inputLines.slice(1);

      let inLimitBlock = false;
      let indentLevel = 0;
      let currentLimitBlock = [];

      for (let i in remainingLines) {
        let line = remainingLines[i];

        if (!line.trim()) {
          continue;
        }

        let fields = line.split("|");

        if (fields[1] == "CODE_UNIT_FINISHED") {
          indentLevel--;
        }

        if (fields[1] == "CUMULATIVE_LIMIT_USAGE") {
          inLimitBlock = true;
        } else if (
          i > 0 &&
          !this.doLinesMatch(line, remainingLines[i - 1]) &&
          !inLimitBlock
        ) {
          let [lineTime, lineNanos] = fields[0].split(" ");
          let lineAction = fields[1];
          let lineDetails = fields.slice(2);

          lineNanos = parseInt(lineNanos.slice(1, -1));

          let block = {
            key: i,
            nanos: lineNanos,
            time: lineTime,
            action: lineAction,
            details: lineDetails,
            indentLevel: indentLevel,
          };

          actionBlocks.push(block);
        }

        if (inLimitBlock) {
          if (fields[1] == "CUMULATIVE_LIMIT_USAGE_END") {
            inLimitBlock = false;
            let block = this.getLimitBlock(currentLimitBlock);
            currentLimitBlock = [];
          } else {
            currentLimitBlock.push(line);
          }
        }

        if (fields[1] == "CODE_UNIT_STARTED") {
          indentLevel++;
        }
      }
    }

    return actionBlocks;
  }

  render() {
    let actionBlocks = this.convertInputToBlocks(this.props.debugInput);
    actionBlocks = actionBlocks.sort((a, b) => {
      return a.nanos - b.nanos;
    });

    let blockChildren = [];

    for (let i in actionBlocks) {
      i = parseInt(i);
      let block = actionBlocks[i];
      let duration;

      if (i < actionBlocks.length - 2) {
        let thisNano = block.nanos;
        let nextNano = actionBlocks[i + 1].nanos;
        duration = Math.round((nextNano - thisNano) / 1000000);
      } else {
        duration = 0;
      }

      blockChildren.push(
        <>
          <ActionBlock
            action={block.action}
            time={block.time}
            details={block.details}
            duration={duration}
            indentLevel={block.indentLevel}
          />
        </>
      );
    }

    return <div>{blockChildren}</div>;
  }
}
