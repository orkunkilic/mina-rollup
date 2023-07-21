"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.push(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.push(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupProof = exports.RollupProof_ = void 0;
var snarkyjs_1 = require("snarkyjs");
var MerkleWitness20 = /** @class */ (function (_super) {
    __extends(MerkleWitness20, _super);
    function MerkleWitness20() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MerkleWitness20;
}((0, snarkyjs_1.MerkleWitness)(20)));
var RollupState = /** @class */ (function (_super) {
    __extends(RollupState, _super);
    function RollupState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RollupState.createOneStep = function (initialRoot, latestRoot, key, currentValue, incrementAmount, merkleMapWitness) {
        var _a = merkleMapWitness.computeRootAndKey(currentValue), witnessRootBefore = _a[0], witnessKey = _a[1];
        initialRoot.assertEquals(witnessRootBefore);
        witnessKey.assertEquals(key);
        var _b = merkleMapWitness.computeRootAndKey(currentValue.add(incrementAmount)), witnessRootAfter = _b[0], _ = _b[1];
        latestRoot.assertEquals(witnessRootAfter);
        return new RollupState({
            initialRoot: initialRoot,
            latestRoot: latestRoot
        });
    };
    RollupState.createMerged = function (state1, state2) {
        return new RollupState({
            initialRoot: state1.initialRoot,
            latestRoot: state2.latestRoot
        });
    };
    RollupState.assertEquals = function (state1, state2) {
        state1.initialRoot.assertEquals(state2.initialRoot);
        state1.latestRoot.assertEquals(state2.latestRoot);
    };
    return RollupState;
}((0, snarkyjs_1.Struct)({
    initialRoot: snarkyjs_1.Field,
    latestRoot: snarkyjs_1.Field,
})));
// ===============================================================
var Rollup = snarkyjs_1.Experimental.ZkProgram({
    publicInput: RollupState,
    publicOutput: snarkyjs_1.Empty,
    methods: {
        oneStep: {
            privateInputs: [snarkyjs_1.Field, snarkyjs_1.Field, snarkyjs_1.Field, snarkyjs_1.Field, snarkyjs_1.Field, snarkyjs_1.MerkleMapWitness],
            method: function (state, initialRoot, latestRoot, key, currentValue, incrementAmount, merkleMapWitness) {
                var computedState = RollupState.createOneStep(initialRoot, latestRoot, key, currentValue, incrementAmount, merkleMapWitness);
                RollupState.assertEquals(computedState, state);
                return undefined;
            }
        },
        merge: {
            privateInputs: [snarkyjs_1.SelfProof, snarkyjs_1.SelfProof],
            method: function (newState, rollup1proof, rollup2proof) {
                rollup1proof.verify();
                rollup2proof.verify();
                rollup2proof.publicInput.initialRoot.assertEquals(rollup1proof.publicInput.latestRoot);
                rollup1proof.publicInput.initialRoot.assertEquals(newState.initialRoot);
                rollup2proof.publicInput.latestRoot.assertEquals(newState.latestRoot);
                return undefined;
            }
        }
    },
});
exports.RollupProof_ = snarkyjs_1.Experimental.ZkProgram.Proof(Rollup);
var RollupProof = /** @class */ (function (_super) {
    __extends(RollupProof, _super);
    function RollupProof() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RollupProof;
}(exports.RollupProof_));
exports.RollupProof = RollupProof;
// ===============================================================
var RollupContract = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _state_decorators;
    var _state_initializers = [];
    var _initStateRoot_decorators;
    var _update_decorators;
    return _a = /** @class */ (function (_super) {
            __extends(RollupContract, _super);
            function RollupContract() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = (__runInitializers(_this, _instanceExtraInitializers), __runInitializers(_this, _state_initializers, (0, snarkyjs_1.State)()));
                return _this;
            }
            RollupContract.prototype.deploy = function (args) {
                _super.prototype.deploy.call(this, args);
                // this.setPermissions({
                //   ...Permissions.default(),
                //   editState: Permissions.proofOrSignature(),
                // });
            };
            RollupContract.prototype.initStateRoot = function (stateRoot) {
                this.state.set(stateRoot);
            };
            RollupContract.prototype.update = function (rollupStateProof) {
                var currentState = this.state.get();
                this.state.assertEquals(currentState);
                rollupStateProof.publicInput.initialRoot.assertEquals(currentState);
                rollupStateProof.verify();
                this.state.set(rollupStateProof.publicInput.latestRoot);
            };
            return RollupContract;
        }(snarkyjs_1.SmartContract)),
        (function () {
            _state_decorators = [(0, snarkyjs_1.state)(snarkyjs_1.Field)];
            _initStateRoot_decorators = [snarkyjs_1.method];
            _update_decorators = [snarkyjs_1.method];
            __esDecorate(_a, null, _initStateRoot_decorators, { kind: "method", name: "initStateRoot", static: false, private: false, access: { has: function (obj) { return "initStateRoot" in obj; }, get: function (obj) { return obj.initStateRoot; } } }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } } }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: function (obj) { return "state" in obj; }, get: function (obj) { return obj.state; }, set: function (obj, value) { obj.state = value; } } }, _state_initializers, _instanceExtraInitializers);
        })(),
        _a;
}();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var verificationKey, transitions, map, rollupStepInfo, rollupProofs, _i, rollupStepInfo_1, _a, initialRoot, latestRoot, key, currentValue, increment, witness, rollup, proof_1, proof, i, rollup, mergedProof, ok;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('compiling...');
                    return [4 /*yield*/, Rollup.compile()];
                case 1:
                    verificationKey = (_b.sent()).verificationKey;
                    console.log('generating transition information');
                    transitions = [
                        { key: (0, snarkyjs_1.Field)(8),
                            increment: (0, snarkyjs_1.Field)(3),
                        },
                        { key: (0, snarkyjs_1.Field)(43),
                            increment: (0, snarkyjs_1.Field)(2),
                        },
                        { key: (0, snarkyjs_1.Field)(6),
                            increment: (0, snarkyjs_1.Field)(3999),
                        },
                        { key: (0, snarkyjs_1.Field)(8),
                            increment: (0, snarkyjs_1.Field)(400),
                        },
                    ];
                    map = new snarkyjs_1.MerkleMap();
                    rollupStepInfo = [];
                    transitions.forEach(function (_a) {
                        var key = _a.key, increment = _a.increment;
                        var witness = map.getWitness(key);
                        var initialRoot = map.getRoot();
                        var currentValue = map.get(key);
                        var updatedValue = map.get(key).add(increment);
                        map.set(key, updatedValue);
                        var latestRoot = map.getRoot();
                        rollupStepInfo.push({ initialRoot: initialRoot, latestRoot: latestRoot, key: key, currentValue: currentValue, increment: increment, witness: witness });
                    });
                    console.log('making first set of proofs');
                    rollupProofs = [];
                    _i = 0, rollupStepInfo_1 = rollupStepInfo;
                    _b.label = 2;
                case 2:
                    if (!(_i < rollupStepInfo_1.length)) return [3 /*break*/, 5];
                    _a = rollupStepInfo_1[_i], initialRoot = _a.initialRoot, latestRoot = _a.latestRoot, key = _a.key, currentValue = _a.currentValue, increment = _a.increment, witness = _a.witness;
                    rollup = RollupState.createOneStep(initialRoot, latestRoot, key, currentValue, increment, witness);
                    return [4 /*yield*/, Rollup.oneStep(rollup, initialRoot, latestRoot, key, currentValue, increment, witness)];
                case 3:
                    proof_1 = _b.sent();
                    rollupProofs.push(proof_1);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('merging proofs');
                    proof = rollupProofs[0];
                    i = 1;
                    _b.label = 6;
                case 6:
                    if (!(i < rollupProofs.length)) return [3 /*break*/, 9];
                    rollup = RollupState.createMerged(proof.publicInput, rollupProofs[i].publicInput);
                    return [4 /*yield*/, Rollup.merge(rollup, proof, rollupProofs[i])];
                case 7:
                    mergedProof = _b.sent();
                    proof = mergedProof;
                    _b.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log('verifying rollup');
                    console.log(proof.publicInput.latestRoot.toString());
                    return [4 /*yield*/, (0, snarkyjs_1.verify)(proof.toJSON(), verificationKey)];
                case 10:
                    ok = _b.sent();
                    console.log('ok', ok);
                    return [2 /*return*/];
            }
        });
    });
}
main();
