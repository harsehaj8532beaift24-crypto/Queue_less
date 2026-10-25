import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Upload, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Building2, 
  RefreshCw, 
  X,
  Play,
  Square,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { qrApi } from '../api/client';

export function QRScannerView({ venue = null, onTokenAction = null }) {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const readerElementId = 'queueless-html5-qr-reader';

  // Stop camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (scanMode !== 'camera') {
      stopCamera();
    }
  }, [scanMode]);

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping QR camera scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setVerificationError(null);
    setActionSuccessMessage(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }

      const qrConfig = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        qrConfig,
        onQrCodeScanned,
        (errorMessage) => {
          // Scanning frame with no QR code detected - non fatal, ignored
        }
      );

      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera initialization failure:', err);
      setIsCameraActive(false);
      setCameraError(
        err?.message || 'Unable to access device camera. Please allow camera permissions or use the file upload / manual token entry tab.'
      );
    }
  };

  // Called when QR code is decoded from camera or image file
  const onQrCodeScanned = async (decodedText) => {
    if (!decodedText || isVerifying) return;
    // Stop camera once scanned successfully to preserve battery & avoid repeated scans
    await stopCamera();
    await verifyPayload(decodedText);
  };

  // Handle image upload scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerificationError(null);
    setVerificationResult(null);
    setActionSuccessMessage(null);
    setIsVerifying(true);

    try {
      const scanner = new Html5Qrcode('queueless-upload-scanner-dummy');
      const decodedText = await scanner.scanFile(file, true);
      await scanner.clear();
      await verifyPayload(decodedText);
    } catch (err) {
      setIsVerifying(false);
      setVerificationError(
        'Could not detect a valid QR code in the uploaded image. Please ensure the image is clear and well-lit, or type the token number manually.'
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Main verification logic connecting to real MongoDB backend
  const verifyPayload = async (payload) => {
    if (!payload || !payload.trim()) return;

    setIsVerifying(true);
    setVerificationError(null);
    setActionSuccessMessage(null);

    try {
      const res = await qrApi.verify({
        qrData: payload.trim(),
        businessId: venue?._id || venue?.id || null,
      });

      if (res && res.success && res.data) {
        setVerificationResult(res);
      } else {
        setVerificationError(res?.message || 'Token record not found in MongoDB database.');
        setVerificationResult(null);
      }
    } catch (err) {
      setVerificationError(err?.message || 'Verification rejected: Non-existent or counterfeit token pass.');
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle staff action (Call, Serve, Complete, Skip)
  const handleExecuteAction = async (action) => {
    if (!verificationResult?.data?.tokenId) return;

    setActionInProgress(true);
    setActionSuccessMessage(null);
    setVerificationError(null);

    const tokenId = verificationResult.data.tokenId;
    const businessId = venue?._id || venue?.id;

    try {
      const res = await qrApi.executeAction(tokenId, action, businessId);
      if (res && res.success) {
        setActionSuccessMessage(res.message || `Action "${action}" processed successfully.`);
        // Refresh token state in result card
        setVerificationResult(prev => {
          if (!prev) return null;
          let newStatus = 'waiting';
          let newOutcome = prev.outcome;
          let newEligible = prev.isEligible;

          if (action === 'call') {
            newStatus = 'calling';
            newOutcome = 'VALID_CALLED';
          } else if (action === 'serve') {
            newStatus = 'serving';
            newOutcome = 'VALID_CALLED';
          } else if (action === 'complete') {
            newStatus = 'completed';
            newOutcome = 'ALREADY_SERVED';
            newEligible = false;
          } else if (action === 'skip') {
            newStatus = 'skipped';
            newOutcome = 'SKIPPED';
            newEligible = false;
          } else if (action === 'cancel') {
            newStatus = 'cancelled';
            newOutcome = 'CANCELLED';
            newEligible = false;
          }

          return {
            ...prev,
            outcome: newOutcome,
            isEligible: newEligible,
            message: `Updated to ${newStatus}.`,
            data: {
              ...prev.data,
              status: newStatus,
            },
          };
        });

        if (onTokenAction) {
          onTokenAction(tokenId, action);
        }
      } else {
        setVerificationError(res?.message || 'Unable to update token status.');
      }
    } catch (err) {
      setVerificationError(err?.message || 'Failed to execute counter action on token.');
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'waiting':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>Waiting in Queue</span>;
      case 'calling':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem' }}>Called to Counter</span>;
      case 'serving':
        return <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>Currently Serving</span>;
      case 'completed':
        return <span className="badge badge-charcoal" style={{ fontSize: '0.8rem' }}>Service Completed</span>;
      case 'cancelled':
        return <span className="badge badge-rose" style={{ fontSize: '0.8rem' }}>Cancelled</span>;
      case 'skipped':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>Skipped (No-Show)</span>;
      default:
        return <span className="badge badge-indigo" style={{ fontSize: '0.8rem' }}>{status || 'Unknown'}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Hidden dummy element required for scanFile */}
      <div id="queueless-upload-scanner-dummy" style={{ display: 'none' }} />

      {/* Header Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={13} />
            <span>Encrypted Token Verification</span>
          </span>
          {venue && (
            <span className="badge badge-charcoal" style={{ fontSize: '0.75rem' }}>
              {venue.name}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
          QR Code Ticket Scanner
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Scan digital customer passes using the camera, upload a saved ticket QR image, or enter a Token ID manually to verify booking validity in MongoDB.
        </p>
      </div>

      {/* Scan Mode Switcher Pills */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-secondary)',
        padding: '0.3rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        gap: '0.4rem',
      }}>
        <button
          type="button"
          onClick={() => setScanMode('camera')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: scanMode === 'camera' ? 'var(--btn-primary-bg, #262626)' : 'transparent',
            color: scanMode === 'camera' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Camera size={15} />
          <span>Device Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMode('upload')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: scanMode === 'upload' ? 'var(--btn-primary-bg, #262626)' : 'transparent',
            color: scanMode === 'upload' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={15} />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMode('manual')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: scanMode === 'manual' ? 'var(--btn-primary-bg, #262626)' : 'transparent',
            color: scanMode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <Search size={15} />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* SCANNER CONTAINER */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* MODE 1: CAMERA SCAN */}
        {scanMode === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
              id={readerElementId}
              style={{
                width: '100%',
                maxWidth: '340px',
                minHeight: isCameraActive ? '260px' : '0px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: isCameraActive ? '#000000' : 'transparent',
              }}
            />

            {!isCameraActive ? (
              <div style={{
                width: '100%',
                padding: '2.5rem 1rem',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}>
                  <Camera size={26} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                    Camera Scanner Inactive
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '280px' }}>
                    Activate your device camera to scan visitor QR passes presented at the service counter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-primary"
                  style={{ marginTop: '0.5rem', padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
                >
                  <Play size={15} />
                  <span>Activate Camera</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: 'var(--rose)' }}
                >
                  <Square size={14} />
                  <span>Stop Camera</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid var(--rose)',
                color: 'var(--rose)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: UPLOAD IMAGE */}
        {scanMode === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '2.5rem 1.5rem',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}>
                <Upload size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                  Select or Drop QR Ticket Image
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  PNG, JPG, or screenshot files containing a QueueLess token QR code
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Image File
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: MANUAL ENTRY */}
        {scanMode === 'manual' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyPayload(manualInput);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div>
              <label htmlFor="manualTokenInput" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Enter Token Number or Encrypted Hash:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="manualTokenInput"
                  type="text"
                  placeholder="e.g. QL-OPD-101 or paste pass URL"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="submit"
                  disabled={isVerifying || !manualInput.trim()}
                  className="btn-primary"
                  style={{ padding: '0 1.25rem', fontSize: '0.85rem' }}
                >
                  {isVerifying ? (
                    <RefreshCw size={15} className="spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  <span>Verify</span>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>Sample references:</span>
              <button
                type="button"
                onClick={() => { setManualInput('QL-OPD-101'); verifyPayload('QL-OPD-101'); }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                QL-OPD-101
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setManualInput('QL-CS-101'); verifyPayload('QL-CS-101'); }}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'monospace' }}
              >
                QL-CS-101
              </button>
            </div>
          </form>
        )}

        {/* LOADING STATE */}
        {isVerifying && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
          }}>
            <RefreshCw size={18} className="spin" />
            <span>Verifying cryptographic signature with MongoDB...</span>
          </div>
        )}

        {/* VERIFICATION ERROR BANNER */}
        {verificationError && !isVerifying && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid var(--rose)',
            color: 'var(--rose)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Verification Rejected</span>
              <span style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{verificationError}</span>
            </div>
          </div>
        )}

        {/* ACTION SUCCESS BANNER */}
        {actionSuccessMessage && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid var(--emerald)',
            color: 'var(--emerald)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Check size={16} style={{ flexShrink: 0 }} />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* VERIFICATION SUCCESS RESULT CARD */}
        {verificationResult && !isVerifying && (
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            
            {/* Card Status Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Verified Token Pass
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.2rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace', margin: 0, color: 'var(--text-primary)' }}>
                    {verificationResult.data.tokenNumber}
                  </h2>
                  {verificationResult.data.isPriority && (
                    <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                      Priority ({verificationResult.data.priorityReason || 'Verified'})
                    </span>
                  )}
                </div>
              </div>

              <div>
                {getStatusBadge(verificationResult.data.status)}
              </div>
            </div>

            {/* Outcome Notice */}
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 500,
              backgroundColor: verificationResult.outcome === 'ALREADY_SERVED' 
                ? 'rgba(115, 115, 115, 0.1)' 
                : verificationResult.isEligible 
                  ? 'rgba(16, 185, 129, 0.08)' 
                  : 'rgba(245, 158, 11, 0.08)',
              color: verificationResult.outcome === 'ALREADY_SERVED'
                ? 'var(--text-secondary)'
                : verificationResult.isEligible
                  ? 'var(--emerald)'
                  : 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              {verificationResult.outcome === 'ALREADY_SERVED' ? (
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              ) : verificationResult.isEligible ? (
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
              )}
              <span>{verificationResult.message}</span>
            </div>

            {/* Token Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary, #ffffff)',
              fontSize: '0.82rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Customer</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{verificationResult.data.customerName}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Department / Service</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{verificationResult.data.serviceName || 'General Service'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Queue Position</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  #{verificationResult.data.position || 1} ({verificationResult.data.peopleAhead ?? 0} ahead)
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Est. Waiting</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {verificationResult.data.estimatedWaitMinutes ?? 0} mins
                </span>
              </div>
            </div>

            {/* Counter Staff Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Counter Staff Action
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {verificationResult.data.status === 'waiting' && (
                  <>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleExecuteAction('call')}
                      className="btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                    >
                      <span>Call to Counter</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleExecuteAction('serve')}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                    >
                      <span>Begin Serving</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleExecuteAction('skip')}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.8rem', color: 'var(--rose)' }}
                    >
                      <span>No-Show</span>
                    </button>
                  </>
                )}

                {verificationResult.data.status === 'calling' && (
                  <>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleExecuteAction('serve')}
                      className="btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                    >
                      <UserCheck size={14} />
                      <span>Admit & Begin Serving</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleExecuteAction('skip')}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.8rem', color: 'var(--rose)' }}
                    >
                      <span>Mark No-Show</span>
                    </button>
                  </>
                )}

                {verificationResult.data.status === 'serving' && (
                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => handleExecuteAction('complete')}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem', backgroundColor: 'var(--emerald)' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Complete Service</span>
                  </button>
                )}

                {verificationResult.data.status === 'completed' && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    padding: '0.4rem 0',
                  }}>
                    This customer has completed their service. No additional counter actions needed.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default QRScannerView;
